"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw, Cpu } from "lucide-react";

// --- Skeleton components ---

export function SkeletonCards({ count, height }: { count: number; height: string }) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className={`${height} bg-dark-800/50 rounded-xl animate-pulse`} />
            ))}
        </>
    );
}

export function StatsBarSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SkeletonCards count={4} height="h-24" />
        </div>
    );
}

export function MapLoadingPlaceholder() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-dark-800 rounded-xl border border-white/5">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-gray-500">Inicializando enlace satelital...</span>
            </div>
        </div>
    );
}

// --- Error state ---

export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
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

// --- Header ---

export function DashboardHeader({ onReload }: { onReload: () => void }) {
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
