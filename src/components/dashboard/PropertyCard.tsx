"use client";

import { Property } from "@/lib/types";
import { formatPrice, calculateBaths } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Bed, Bath, Ruler, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState, memo, useCallback } from "react";
import Image from "next/image";

interface PropertyCardProps {
    property: Property;
    onAnalyzeOwner: (property: Property) => void;
    onHover?: (id: string | null) => void;
}

// --- Helpers ---

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    sold: { label: "VENDIDO", className: "bg-red-500/80 text-white" },
    pending: { label: "PENDIENTE", className: "bg-yellow-500/80 text-black" },
};

const STATUS_DEFAULT = { label: "EN VENTA", className: "bg-[#00F0FF]/80 text-black" };

function getStatusLabel(status: string): { label: string; className: string } {
    const key = Object.keys(STATUS_MAP).find((k) => status.toLowerCase().includes(k));
    return key ? STATUS_MAP[key] : STATUS_DEFAULT;
}

// --- Sub-components ---

function ImageFallback() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2E] to-[#12121A] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#A855F7]/20 via-transparent to-transparent" />
            <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Sin Imagen</span>
            </div>
        </div>
    );
}

function PropertyImage({ src, alt }: { src: string | null; alt: string }) {
    const [hasError, setHasError] = useState(false);
    const showImage = !hasError && src;

    if (!showImage) return <ImageFallback />;

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setHasError(true)}
        />
    );
}

function PropertySpecs({ property }: { property: Property }) {
    const baths = calculateBaths(property.baths_full, property.baths_half);

    return (
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-1">
                <Bed className="w-3 h-3 text-[#A855F7]" />
                <span>{property.beds}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1">
                <Bath className="w-3 h-3 text-[#A855F7]" />
                <span>{baths}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3 text-[#A855F7]" />
                <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#A855F7]" />
                <span>{property.year_built || "N/A"}</span>
            </div>
        </div>
    );
}

// --- Main component ---

export const PropertyCard = memo(function PropertyCard({ property, onAnalyzeOwner, onHover }: PropertyCardProps) {
    const statusInfo = getStatusLabel(property.status);

    const handleMouseEnter = useCallback(() => onHover?.(property.id), [onHover, property.id]);
    const handleMouseLeave = useCallback(() => onHover?.(null), [onHover]);
    const handleClick = useCallback(() => onAnalyzeOwner(property), [onAnalyzeOwner, property]);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="h-full"
        >
            <Card
                className="glass-card overflow-hidden h-full flex flex-col group border-transparent hover:border-[#00F0FF]/50 transition-colors duration-300 cursor-pointer active:scale-[0.97] transition-transform"
                onClick={handleClick}
            >
                <div className="relative h-48 w-full bg-dark-800">
                    <PropertyImage src={property.primary_photo} alt={property.formatted_address} />

                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <span className="text-white font-bold tracking-wide text-sm">
                            {formatPrice(property.price)}
                        </span>
                    </div>

                    <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusInfo.className}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                        <h3 className="font-semibold text-white leading-tight line-clamp-1" title={property.formatted_address}>
                            {property.street}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {property.city}, {property.state} {property.zip_code}
                        </p>
                    </div>

                    <PropertySpecs property={property} />

                    <div className="mt-auto pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
                            <span>{property.days_on_mls} Días en Mercado</span>
                            <span>{property.property_type?.replace(/_/g, " ") || "RESIDENCIAL"}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});
