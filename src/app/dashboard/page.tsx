"use client";

import { useProperties } from "@/hooks/useProperties";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { PropertyList } from "@/components/dashboard/PropertyList";
import { PropertyDetailSheet } from "@/components/dashboard/PropertyDetailSheet";
import { IntroSequence } from "@/components/IntroSequence";
import { Property } from "@/lib/types";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { RefreshCcw, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

const MapView = dynamic(() => import("@/components/dashboard/MapView"), {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
});

// --- Sub-components ---

function MapLoadingPlaceholder() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-dark-800 rounded-xl border border-white/5">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-gray-500">Inicializando enlace satelital...</span>
            </div>
        </div>
    );
}

function SkeletonCards({ count, height }: { count: number; height: string }) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className={`${height} bg-dark-800/50 rounded-xl animate-pulse`} />
            ))}
        </>
    );
}

function StatsBarSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SkeletonCards count={4} height="h-24" />
        </div>
    );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="h-screen flex items-center justify-center bg-dark-900 text-red-500">
            <div className="text-center space-y-4">
                <p>Error del Sistema: {error}</p>
                <Button onClick={onRetry} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                    Reintentar Conexión
                </Button>
            </div>
        </div>
    );
}

function DashboardHeader({ onReload }: { onReload: () => void }) {
    return (
        <header className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#00F0FF] blur-lg opacity-20" />
                    <Cpu className="w-8 h-8 text-[#00F0FF] relative z-10" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                        PREDESARROLLO<span className="text-[#00F0FF]"> AGENTE DE IA</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
                        Proyecto para Carlos Pulido
                    </p>
                </div>
                <div className="px-2 py-0.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded text-[10px] font-bold text-[#00F0FF]">
                    v0.9.5 (Live Data)
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5" onClick={onReload}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Sincronizar
                </Button>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-md border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-400 font-mono">Feed en Vivo</span>
                </div>
            </div>
        </header>
    );
}

// --- Main component ---

export default function DashboardPage() {
    const { properties, stats, isLoading, error } = useProperties();
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const handleOpenDetail = useCallback((property: Property) => {
        setSelectedProperty(property);
        setIsSheetOpen(true);
    }, []);

    const handlePropertyHover = useCallback((id: string | null) => {
        setHighlightedPropertyId(id);
    }, []);

    const reloadData = useCallback(() => window.location.reload(), []);

    if (showIntro) {
        return <IntroSequence onComplete={() => setShowIntro(false)} />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={reloadData} />;
    }

    return (
        <main className="h-screen flex flex-col p-4 md:p-6 overflow-hidden bg-dark-900 text-white selection:bg-[#00F0FF]/30">
            <DashboardHeader onReload={reloadData} />

            <div className="shrink-0">
                {isLoading ? <StatsBarSkeleton /> : <StatsBar stats={stats} />}
            </div>

            <div className="flex-grow flex gap-6 min-h-0">
                <div className="w-1/2 hidden md:block rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                    <div className="absolute inset-0 pointer-events-none border-2 border-[#00F0FF]/0 group-hover:border-[#00F0FF]/20 transition-all z-20 rounded-xl" />
                    {isLoading ? (
                        <div className="w-full h-full bg-dark-800 animate-pulse flex items-center justify-center">
                            <span className="font-mono text-gray-600">Cargando Datos Geoespaciales...</span>
                        </div>
                    ) : (
                        <MapView
                            properties={properties}
                            highlightedPropertyId={highlightedPropertyId}
                            onPropertySelect={handleOpenDetail}
                        />
                    )}
                </div>

                <div className="w-full md:w-1/2 flex flex-col min-h-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            <SkeletonCards count={3} height="h-48" />
                        </div>
                    ) : (
                        <PropertyList
                            properties={properties}
                            onAnalyzeOwner={handleOpenDetail}
                            onHover={handlePropertyHover}
                        />
                    )}
                </div>
            </div>

            <PropertyDetailSheet
                property={selectedProperty}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
        </main>
    );
}
