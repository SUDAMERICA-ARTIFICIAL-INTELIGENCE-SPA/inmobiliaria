"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Property } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";

// --- Icon constants (created once, reused across renders) ---

const ICON_NORMAL = L.divIcon({
    className: "custom-neon-marker",
    html: `<div style="
    width: 14px; height: 14px;
    background-color: #00F0FF;
    border-radius: 50%;
    box-shadow: 0 0 8px #00F0FF, inset 0 0 4px rgba(255,255,255,0.8);
    border: 2px solid white;
    transition: all 0.3s ease;
  "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const ICON_HIGHLIGHTED = L.divIcon({
    className: "custom-neon-marker",
    html: `<div style="
    width: 22px; height: 22px;
    background-color: #A855F7;
    border-radius: 50%;
    box-shadow: 0 0 20px #A855F7, inset 0 0 4px rgba(255,255,255,0.8);
    border: 2px solid white;
    transition: all 0.3s ease;
  "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

// --- Constants ---

const DEFAULT_CENTER: [number, number] = [25.7617, -80.1918];
const DEFAULT_ZOOM = 11;

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// --- Helpers ---

function formatPrice(value: number): string {
    return `US$ ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function hasCoordinates(p: Property): p is Property & { latitude: number; longitude: number } {
    return p.latitude != null && p.longitude != null;
}

// --- Sub-components ---

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function MarkerPopupContent({ property }: { property: Property }) {
    return (
        <div className="min-w-[220px] bg-white rounded-lg overflow-hidden shadow-xl">
            {property.primary_photo && (
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
                    <span>{property.baths_full} Baños</span>
                    <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
            </div>
        </div>
    );
}

interface PropertyMarkerProps {
    property: Property & { latitude: number; longitude: number };
    isHighlighted: boolean;
    onSelect: (property: Property) => void;
}

function PropertyMarker({ property, isHighlighted, onSelect }: PropertyMarkerProps) {
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
}

// --- Main component ---

interface MapViewProps {
    properties: Property[];
    highlightedPropertyId: string | null;
    onPropertySelect: (property: Property) => void;
}

export default function MapView({ properties, highlightedPropertyId, onPropertySelect }: MapViewProps) {
    const geoProperties = useMemo(
        () => properties.filter(hasCoordinates),
        [properties]
    );

    const activeProperty = useMemo(
        () => geoProperties.find((p) => p.id === highlightedPropertyId),
        [geoProperties, highlightedPropertyId]
    );

    const center: [number, number] = activeProperty
        ? [activeProperty.latitude, activeProperty.longitude]
        : DEFAULT_CENTER;

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                className="h-full w-full rounded-xl overflow-hidden shadow-2xl border border-white/5"
                zoomControl={false}
            >
                <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />

                {geoProperties.map((property) => (
                    <PropertyMarker
                        key={property.id}
                        property={property}
                        isHighlighted={property.id === highlightedPropertyId}
                        onSelect={onPropertySelect}
                    />
                ))}

                {highlightedPropertyId && <MapUpdater center={center} />}
            </MapContainer>
        </div>
    );
}
