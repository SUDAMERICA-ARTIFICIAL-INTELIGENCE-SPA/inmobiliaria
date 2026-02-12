"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Property } from "@/lib/types";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Bed,
    Bath,
    Ruler,
    Calendar,
    MapPin,
    Building2,
    ExternalLink,
    Lock,
    Phone,
    Mail,
    Shield,
    User,
} from "lucide-react";

interface PropertyDetailSheetProps {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
}

function formatPrice(value: number): string {
    return `US$ ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// Deterministic mock LLC names based on property ID
const LLC_NAMES = [
    "Miami Beach Holdings LLC",
    "Sunshine State Properties LLC",
    "Coral Gables Investment Group LLC",
    "Biscayne Bay Capital LLC",
    "South Florida Realty Trust",
    "Palm Grove Investments LLC",
    "Ocean Drive Holdings Corp",
    "Dade County Properties LLC",
    "Key Biscayne Ventures LLC",
    "Brickell Capital Partners LLC",
    "Coconut Grove Estates LLC",
    "Flagler Street Holdings LLC",
    "Wynwood Investment Group LLC",
    "Design District Capital LLC",
    "Aventura Properties Trust",
];

const FIRST_NAMES = ["Carlos", "Maria", "Jorge", "Ana", "Roberto", "Isabella", "Miguel", "Sofia"];
const LAST_NAMES = ["Rodriguez", "Martinez", "Lopez", "Garcia", "Hernandez", "Perez", "Gonzalez", "Diaz"];

function generateOwnerData(property: Property) {
    // Use hash of property ID for consistency
    const hash = property.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const isLLC = hash % 3 !== 0;
    const llcName = LLC_NAMES[hash % LLC_NAMES.length];
    const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(hash + 3) % LAST_NAMES.length];

    const areaCode = ["305", "786", "954"][hash % 3];
    const emailDomain = ["gmail.com", "outlook.com", "yahoo.com"][hash % 3];

    return {
        name: isLLC ? llcName : `${firstName} ${lastName}`,
        type: isLLC ? "LLC" : "Individual",
        phone: `+1 ${areaCode} *** ****`,
        email: `${firstName.toLowerCase().slice(0, 3)}***@${emailDomain}`,
        registered: `${2005 + (hash % 18)}`,
    };
}

export function PropertyDetailSheet({
    property,
    isOpen,
    onClose,
}: PropertyDetailSheetProps) {
    const [imgError, setImgError] = useState(false);
    const [unlocked, setUnlocked] = useState(false);

    const owner = useMemo(
        () => (property ? generateOwnerData(property) : null),
        [property]
    );

    const handleUnlock = useCallback(() => {
        setUnlocked(true);
    }, []);

    // Reset state when property changes
    if (!property) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-lg bg-[#0A0A0F] border-l border-white/10 text-white overflow-y-auto p-0">
                {/* Hero Image */}
                <div className="relative w-full h-56 bg-dark-800">
                    {!imgError && property.primary_photo ? (
                        <img
                            src={property.primary_photo}
                            alt={property.formatted_address}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1A1A2E] via-[#12121A] to-[#0A0A0F] flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-white/10" />
                        </div>
                    )}
                    {/* Price Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                        <p className="text-2xl font-bold text-white">
                            {formatPrice(property.price)}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                            {property.formatted_address}
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* SheetHeader hidden but accessible */}
                    <SheetHeader className="sr-only">
                        <SheetTitle>Detalles de la Propiedad</SheetTitle>
                    </SheetHeader>

                    {/* Property Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-3"
                    >
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Bed className="w-4 h-4 text-[#00F0FF]" />
                                <span className="text-xs text-gray-400">Habitaciones</span>
                            </div>
                            <p className="text-xl font-bold text-white">{property.beds}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Bath className="w-4 h-4 text-[#00F0FF]" />
                                <span className="text-xs text-gray-400">Baños</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                                {property.baths_full + (property.baths_half * 0.5)}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Ruler className="w-4 h-4 text-[#A855F7]" />
                                <span className="text-xs text-gray-400">Superficie</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                                {property.sqft.toLocaleString()} <span className="text-sm text-gray-400">sqft</span>
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#A855F7]" />
                                <span className="text-xs text-gray-400">Año</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                                {property.year_built || "N/A"}
                            </p>
                        </div>
                    </motion.div>

                    {/* Location */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                        <MapPin className="w-5 h-5 text-[#00F0FF] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-white">
                                {property.street}
                                {property.unit && `, ${property.unit}`}
                            </p>
                            <p className="text-xs text-gray-400">
                                {property.city}, {property.state} {property.zip_code}
                            </p>
                        </div>
                    </motion.div>

                    {/* PROPIETARIO DETECTADO */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#FF006E]" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#FF006E]">
                                Propietario Detectado
                            </h3>
                        </div>

                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-5 border border-[#FF006E]/20 space-y-4">
                            {/* Owner Name */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/5 rounded-full">
                                    <User className="w-4 h-4 text-gray-300" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                                        Titular Registrado
                                    </p>
                                    <p className="font-semibold text-white text-lg">
                                        {owner?.name}
                                    </p>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/30 font-bold">
                                        {owner?.type}
                                    </span>
                                </div>
                            </div>

                            {/* Contact — Censored */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-mono text-gray-400">
                                        {unlocked ? `+1 305 847 2195` : owner?.phone}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-mono text-gray-400">
                                        {unlocked ? `contacto@empresa.com` : owner?.email}
                                    </span>
                                </div>
                            </div>

                            {/* Unlock Button */}
                            {!unlocked ? (
                                <Button
                                    onClick={handleUnlock}
                                    className="w-full bg-gradient-to-r from-[#FF006E] to-[#A855F7] hover:from-[#FF006E]/80 hover:to-[#A855F7]/80 text-white border-0 shadow-[0_0_20px_rgba(255,0,110,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 font-bold"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    DESBLOQUEAR CONTACTO
                                </Button>
                            ) : (
                                <div className="text-center py-2">
                                    <span className="text-xs text-green-400 font-mono">
                                        ✓ Contacto desbloqueado (demo)
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Description */}
                    {property.description && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">
                                Descripción
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                                {property.description}
                            </p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3 pt-2"
                    >
                        {property.url && (
                            <Button
                                variant="outline"
                                onClick={() => window.open(property.url, "_blank")}
                                className="w-full bg-transparent border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver Fuente Original
                            </Button>
                        )}

                        <p className="text-[10px] text-center text-gray-600 pt-2">
                            Los datos de contacto son simulados para fines de demostración.
                            <br />
                            Sistema OSINT — Predesarrollo v0.9.5
                        </p>
                    </motion.div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
