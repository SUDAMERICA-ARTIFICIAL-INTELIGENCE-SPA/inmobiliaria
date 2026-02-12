"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Property } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Custom Neon Icon
const createNeonIcon = (highlighted: boolean) => L.divIcon({
    className: "custom-neon-marker",
    html: `<div style="
    width: ${highlighted ? '22px' : '14px'};
    height: ${highlighted ? '22px' : '14px'};
    background-color: ${highlighted ? '#A855F7' : '#00F0FF'};
    border-radius: 50%;
    box-shadow: 0 0 ${highlighted ? '20px' : '8px'} ${highlighted ? '#A855F7' : '#00F0FF'}, inset 0 0 4px rgba(255,255,255,0.8);
    border: 2px solid white;
    transition: all 0.3s ease;
  "></div>`,
    iconSize: highlighted ? [22, 22] : [14, 14],
    iconAnchor: highlighted ? [11, 11] : [7, 7],
});

interface MapViewProps {
    properties: Property[];
    highlightedPropertyId: string | null;
    onPropertySelect: (property: Property) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function formatPrice(value: number): string {
    return `US$ ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function MapView({ properties, highlightedPropertyId, onPropertySelect }: MapViewProps) {
    const defaultCenter: [number, number] = [25.7617, -80.1918];

    const activeProp = properties.find(p => p.id === highlightedPropertyId);
    const center = activeProp?.latitude && activeProp?.longitude
        ? [activeProp.latitude, activeProp.longitude] as [number, number]
        : defaultCenter;

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={11}
                className="h-full w-full rounded-xl overflow-hidden shadow-2xl border border-white/5"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {properties.map((property, index) => (
                    property.latitude && property.longitude && (
                        <Marker
                            key={`${property.id}-${index}`}
                            position={[property.latitude, property.longitude]}
                            icon={createNeonIcon(property.id === highlightedPropertyId)}
                            eventHandlers={{
                                click: () => onPropertySelect(property),
                            }}
                            zIndexOffset={property.id === highlightedPropertyId ? 1000 : 0}
                        >
                            <Popup className="glass-popup">
                                <div className="min-w-[220px] bg-white rounded-lg overflow-hidden shadow-xl">
                                    {property.primary_photo && (
                                        <img
                                            src={property.primary_photo}
                                            alt={property.street}
                                            className="w-full h-24 object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
                            </Popup>
                        </Marker>
                    )
                ))}

                {highlightedPropertyId && <MapUpdater center={center} />}
            </MapContainer>
        </div>
    );
}
