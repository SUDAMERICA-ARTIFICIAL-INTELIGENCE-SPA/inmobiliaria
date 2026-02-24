"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { Property } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";

// --- Icon constants (created once, reused across renders) ---

function createNeonMarker(size: number, color: string, glowRadius: number): L.DivIcon {
    const anchor = size / 2;
    return L.divIcon({
        className: "custom-neon-marker",
        html: `<div style="
      width: ${size}px; height: ${size}px;
      background-color: ${color};
      border-radius: 50%;
      box-shadow: 0 0 ${glowRadius}px ${color}, inset 0 0 4px rgba(255,255,255,0.8);
      border: 2px solid white;
      transition: all 0.3s ease;
    "></div>`,
        iconSize: [size, size],
        iconAnchor: [anchor, anchor],
    });
}

function createClusterIcon(count: number): L.DivIcon {
    const size = count < 10 ? 36 : count < 50 ? 44 : 52;
    return L.divIcon({
        className: "custom-cluster-marker",
        html: `<div style="
      width: ${size}px; height: ${size}px;
      background: rgba(0,240,255,0.25);
      border: 2px solid #00F0FF;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: bold; color: #fff;
      box-shadow: 0 0 12px rgba(0,240,255,0.4);
      backdrop-filter: blur(4px);
    ">${count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

const ICON_NORMAL = createNeonMarker(14, "#00F0FF", 8);
const ICON_HIGHLIGHTED = createNeonMarker(22, "#A855F7", 20);

// --- Constants ---

const DEFAULT_CENTER: [number, number] = [25.7617, -80.1918];
const DEFAULT_ZOOM = 11;
const CLUSTER_ZOOM_THRESHOLD = 13;
const CLUSTER_RADIUS = 0.005; // ~500m at this latitude

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// --- Types ---

type GeoProperty = Property & { latitude: number; longitude: number };

interface Cluster {
    id: string;
    lat: number;
    lng: number;
    count: number;
    properties: GeoProperty[];
}

// --- Helpers ---

function hasCoordinates(p: Property): p is GeoProperty {
    return p.latitude != null && p.longitude != null;
}

/** Grid-based spatial clustering. Single-pass O(n). */
function clusterProperties(properties: GeoProperty[], radius: number): Cluster[] {
    const grid = new Map<string, { props: GeoProperty[]; latSum: number; lngSum: number }>();

    for (const p of properties) {
        const cellKey = `${Math.floor(p.latitude / radius)}_${Math.floor(p.longitude / radius)}`;
        const cell = grid.get(cellKey);
        if (cell) {
            cell.props.push(p);
            cell.latSum += p.latitude;
            cell.lngSum += p.longitude;
        } else {
            grid.set(cellKey, { props: [p], latSum: p.latitude, lngSum: p.longitude });
        }
    }

    const clusters: Cluster[] = [];
    for (const [key, { props, latSum, lngSum }] of grid) {
        clusters.push({
            id: key,
            lat: latSum / props.length,
            lng: lngSum / props.length,
            count: props.length,
            properties: props,
        });
    }
    return clusters;
}

// --- Sub-components ---

const FLY_TO_ZOOM = 14;
const FLY_TO_DURATION = 1.2;
const DEBOUNCE_MS = 150;

function MapUpdater({ center }: { center: [number, number] | null }) {
    const map = useMap();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const defaultCenterRef = useRef<[number, number] | null>(null);

    useEffect(() => {
        if (!defaultCenterRef.current) {
            defaultCenterRef.current = [map.getCenter().lat, map.getCenter().lng];
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            if (center) {
                map.flyTo(center, Math.max(map.getZoom(), FLY_TO_ZOOM), { duration: FLY_TO_DURATION });
            } else if (defaultCenterRef.current) {
                map.flyTo(defaultCenterRef.current, DEFAULT_ZOOM, { duration: FLY_TO_DURATION });
            }
        }, DEBOUNCE_MS);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [center, map]);

    return null;
}

/** Tracks current zoom level to toggle clustering vs individual markers. */
function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
    useMapEvents({
        zoomend: (e) => onZoomChange(e.target.getZoom()),
    });
    return null;
}

function MarkerPopupContent({ property }: { property: Property }) {
    return (
        <div className="min-w-[220px] bg-white rounded-lg overflow-hidden shadow-xl">
            {property.primary_photo && (
                // eslint-disable-next-line @next/next/no-img-element -- next/image is incompatible with Leaflet popups
                <img
                    src={property.primary_photo}
                    alt={property.street}
                    className="w-full h-24 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
            )}
            <div className="p-3">
                <p className="font-bold text-sm text-gray-900">{formatPrice(property.price)}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{property.street}</p>
                <p className="text-xs text-gray-400">{property.city}, {property.state}</p>
                <div className="flex gap-3 text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                    <span>{property.beds} Hab</span>
                    <span>{property.baths_full} Ba&ntilde;os</span>
                    <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
            </div>
        </div>
    );
}

function ClusterPopupContent({ cluster }: { cluster: Cluster }) {
    const preview = cluster.properties.slice(0, 3);
    return (
        <div className="min-w-[200px] bg-white rounded-lg overflow-hidden shadow-xl p-3">
            <p className="font-bold text-sm text-gray-900 mb-1">{cluster.count} propiedades</p>
            {preview.map((p) => (
                <p key={p.id} className="text-xs text-gray-600 truncate">
                    {p.street} &mdash; {formatPrice(p.price)}
                </p>
            ))}
            {cluster.count > 3 && (
                <p className="text-xs text-gray-400 mt-1">+{cluster.count - 3} m&aacute;s</p>
            )}
        </div>
    );
}

interface PropertyMarkerProps {
    property: GeoProperty;
    isHighlighted: boolean;
    onSelect: (property: Property) => void;
}

const PropertyMarker = memo(function PropertyMarker({ property, isHighlighted, onSelect }: PropertyMarkerProps) {
    const icon = isHighlighted ? ICON_HIGHLIGHTED : ICON_NORMAL;
    const zOffset = isHighlighted ? 1000 : 0;

    return (
        <Marker
            position={[property.latitude, property.longitude]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(property) }}
            zIndexOffset={zOffset}
        >
            <Popup className="glass-popup">
                <MarkerPopupContent property={property} />
            </Popup>
        </Marker>
    );
});

const ClusterMarker = memo(function ClusterMarker({ cluster }: { cluster: Cluster }) {
    const icon = useMemo(() => createClusterIcon(cluster.count), [cluster.count]);

    return (
        <Marker position={[cluster.lat, cluster.lng]} icon={icon}>
            <Popup className="glass-popup">
                <ClusterPopupContent cluster={cluster} />
            </Popup>
        </Marker>
    );
});

// --- Main component ---

interface MapViewProps {
    properties: Property[];
    highlightedPropertyId: string | null;
    onPropertySelect: (property: Property) => void;
}

export default function MapView({ properties, highlightedPropertyId, onPropertySelect }: MapViewProps) {
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    const geoProperties = useMemo(
        () => properties.filter(hasCoordinates),
        [properties]
    );

    const clusters = useMemo(
        () => clusterProperties(geoProperties, CLUSTER_RADIUS),
        [geoProperties]
    );

    const showClusters = zoom < CLUSTER_ZOOM_THRESHOLD;

    const activeProperty = useMemo(
        () => geoProperties.find((p) => p.id === highlightedPropertyId),
        [geoProperties, highlightedPropertyId]
    );

    const flyTarget: [number, number] | null = activeProperty
        ? [activeProperty.latitude, activeProperty.longitude]
        : null;

    const handleZoomChange = useCallback((z: number) => setZoom(z), []);

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                className="h-full w-full rounded-xl overflow-hidden shadow-2xl border border-white/5"
                zoomControl={false}
                preferCanvas
            >
                <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
                <ZoomTracker onZoomChange={handleZoomChange} />

                {showClusters
                    ? clusters.map((cluster) => (
                        <ClusterMarker key={cluster.id} cluster={cluster} />
                    ))
                    : geoProperties.map((property) => (
                        <PropertyMarker
                            key={property.id}
                            property={property}
                            isHighlighted={property.id === highlightedPropertyId}
                            onSelect={onPropertySelect}
                        />
                    ))
                }

                <MapUpdater center={flyTarget} />
            </MapContainer>
        </div>
    );
}

// Export for testing
export { clusterProperties, hasCoordinates };
export type { Cluster, GeoProperty };
