"use client";

import { useProperties } from "@/hooks/useProperties";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { PropertyList } from "@/components/dashboard/PropertyList";
import { PropertyDetailSheet } from "@/components/dashboard/PropertyDetailSheet";
import { IntroSequence } from "@/components/IntroSequence";
import {
    DashboardHeader,
    StatsBarSkeleton,
    SkeletonCards,
    ErrorState,
    MapLoadingPlaceholder,
} from "@/components/dashboard/DashboardShell";
import { Property } from "@/lib/types";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/dashboard/MapView"), {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
});

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
