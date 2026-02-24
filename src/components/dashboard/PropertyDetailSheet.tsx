"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Property, OwnerInfo } from "@/lib/types";
import { formatPrice, isSafeUrl, calculateBaths } from "@/lib/utils";
import { generateOwnerInfo } from "@/lib/mock-owners";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Bed, Bath, Ruler, Calendar, MapPin, Building2,
    ExternalLink, Lock, Phone, Mail, Shield, User,
} from "lucide-react";

// --- Sub-components ---

interface PropertyDetailSheetProps {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
}

function HeroImage({ property }: { property: Property }) {
    const [imgError, setImgError] = useState(false);
    const showPhoto = !imgError && property.primary_photo;

    return (
        <div className="relative w-full h-56 bg-dark-800">
            {showPhoto ? (
                <Image
                    src={property.primary_photo}
                    alt={property.formatted_address}
                    fill
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1A1A2E] via-[#12121A] to-[#0A0A0F] flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-white/10" />
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                <p className="text-2xl font-bold text-white">{formatPrice(property.price)}</p>
                <p className="text-sm text-gray-300 mt-1">{property.formatted_address}</p>
            </div>
        </div>
    );
}

const STAT_ITEMS = [
    { icon: Bed, label: "Habitaciones", key: "beds" as const, color: "#00F0FF" },
    { icon: Bath, label: "Baños", key: "baths" as const, color: "#00F0FF" },
    { icon: Ruler, label: "Superficie", key: "sqft" as const, color: "#A855F7" },
    { icon: Calendar, label: "Año", key: "year" as const, color: "#A855F7" },
];

function StatsGrid({ property }: { property: Property }) {
    const baths = calculateBaths(property.baths_full, property.baths_half);
    const values: Record<string, string> = {
        beds: String(property.beds),
        baths: String(baths),
        sqft: `${property.sqft.toLocaleString()}`,
        year: String(property.year_built || "N/A"),
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
            {STAT_ITEMS.map(({ icon: Icon, label, key, color }) => (
                <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-xs text-gray-400">{label}</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        {values[key]}
                        {key === "sqft" && <span className="text-sm text-gray-400"> sqft</span>}
                    </p>
                </div>
            ))}
        </motion.div>
    );
}

function LocationCard({ property }: { property: Property }) {
    const address = property.unit ? `${property.street}, ${property.unit}` : property.street;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5"
        >
            <MapPin className="w-5 h-5 text-[#00F0FF] mt-0.5 shrink-0" />
            <div>
                <p className="text-sm font-medium text-white">{address}</p>
                <p className="text-xs text-gray-400">
                    {property.city}, {property.state} {property.zip_code}
                </p>
            </div>
        </motion.div>
    );
}

interface OwnerSectionProps {
    owner: OwnerInfo;
    unlocked: boolean;
    onUnlock: () => void;
}

function maskPhone(phone: string): string {
    return phone.replace(/\d{4}$/, "****");
}

function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    return `${local.slice(0, 3)}***@${domain}`;
}

function OwnerSection({ owner, unlocked, onUnlock }: OwnerSectionProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FF006E]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#FF006E]">Propietario Detectado</h3>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-5 border border-[#FF006E]/20 space-y-4">
                <OwnerIdentity name={owner.name} type={owner.type} />
                <ContactInfo owner={owner} unlocked={unlocked} />
                <UnlockButton unlocked={unlocked} onUnlock={onUnlock} />
            </div>
        </motion.div>
    );
}

function OwnerIdentity({ name, type }: { name: string; type: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 bg-white/5 rounded-full">
                <User className="w-4 h-4 text-gray-300" />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Titular Registrado</p>
                <p className="font-semibold text-white text-lg">{name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/30 font-bold">
                    {type}
                </span>
            </div>
        </div>
    );
}

function ContactInfo({ owner, unlocked }: { owner: OwnerInfo; unlocked: boolean }) {
    const phone = unlocked ? owner.phone : maskPhone(owner.phone);
    const email = unlocked ? owner.email : maskEmail(owner.email);

    return (
        <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-mono text-gray-400">{phone}</span>
            </div>
            <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-mono text-gray-400">{email}</span>
            </div>
        </div>
    );
}

function UnlockButton({ unlocked, onUnlock }: { unlocked: boolean; onUnlock: () => void }) {
    if (unlocked) {
        return (
            <div className="text-center py-2">
                <span className="text-xs text-green-400 font-mono">✓ Contacto desbloqueado (demo)</span>
            </div>
        );
    }

    return (
        <Button
            onClick={onUnlock}
            className="w-full bg-gradient-to-r from-[#FF006E] to-[#A855F7] hover:from-[#FF006E]/80 hover:to-[#A855F7]/80 text-white border-0 shadow-[0_0_20px_rgba(255,0,110,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 font-bold"
        >
            <Lock className="w-4 h-4 mr-2" />
            DESBLOQUEAR CONTACTO
        </Button>
    );
}

function ActionsFooter({ url }: { url?: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3 pt-2">
            {url && isSafeUrl(url) && (
                <Button
                    variant="outline"
                    onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
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
    );
}

// --- Main component ---

export function PropertyDetailSheet({ property, isOpen, onClose }: PropertyDetailSheetProps) {
    const [unlocked, setUnlocked] = useState(false);

    const owner = useMemo(
        () => (property ? generateOwnerInfo(property) : null),
        [property]
    );

    const handleUnlock = useCallback(() => setUnlocked(true), []);

    if (!property || !owner) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-lg bg-[#0A0A0F] border-l border-white/10 text-white overflow-y-auto p-0">
                <HeroImage property={property} />

                <div className="p-6 space-y-6">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Detalles de la Propiedad</SheetTitle>
                    </SheetHeader>

                    <StatsGrid property={property} />
                    <LocationCard property={property} />
                    <OwnerSection owner={owner} unlocked={unlocked} onUnlock={handleUnlock} />

                    {property.description && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Descripción</h4>
                            <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">{property.description}</p>
                        </motion.div>
                    )}

                    <ActionsFooter url={property.url} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
