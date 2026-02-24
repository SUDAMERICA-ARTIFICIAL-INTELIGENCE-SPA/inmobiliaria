"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Property, OwnerInfo } from "@/lib/types";
import { generateOwnerInfo } from "@/lib/mock-owners";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Building2, Calendar, DollarSign,
    Contact, Mail, Phone, MapPin,
} from "lucide-react";

// --- Constants ---

const SEARCH_STEPS = [
    "Searching Miami-Dade County Records...",
    "Cross-referencing tax assessor database...",
    "Analyzing ownership chain...",
    "Verifying LLC registration...",
    "Finalizing report...",
];

const PROGRESS_INTERVAL_MS = 40;
const STEP_INTERVAL_MS = 400;
const LOADING_DURATION_MS = 2000;

const RISK_STYLES: Record<string, string> = {
    Low: "bg-green-500/20 border-green-500/50 text-green-400",
    Medium: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
    High: "bg-red-500/20 border-red-500/50 text-red-500",
};

// --- Hooks ---

function useSimulatedSearch(isOpen: boolean, property: Property | null) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [searchStep, setSearchStep] = useState(0);
    const [ownerData, setOwnerData] = useState<OwnerInfo | null>(null);

    useEffect(() => {
        if (!isOpen || !property) return;

        setLoading(true);
        setProgress(0);
        setSearchStep(0);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) { clearInterval(progressInterval); return 100; }
                return prev + 2;
            });
        }, PROGRESS_INTERVAL_MS);

        const stepInterval = setInterval(() => {
            setSearchStep((prev) => Math.min(prev + 1, SEARCH_STEPS.length - 1));
        }, STEP_INTERVAL_MS);

        const timeout = setTimeout(() => {
            setOwnerData(generateOwnerInfo(property));
            setLoading(false);
        }, LOADING_DURATION_MS);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
            clearTimeout(timeout);
        };
    }, [isOpen, property]);

    return { loading, progress, searchStep, ownerData };
}

// --- Sub-components ---

interface OwnerDetailsModalProps {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
}

function LoadingState({ progress, searchStep }: { progress: number; searchStep: number }) {
    return (
        <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 space-y-6"
        >
            <div className="relative">
                <div className="absolute inset-0 bg-[#00F0FF] blur-2xl opacity-20 animate-pulse" />
                <Search className="w-16 h-16 text-[#00F0FF] animate-bounce" />
            </div>

            <div className="w-full space-y-2">
                <h3 className="text-xl font-bold text-center text-[#00F0FF]">Skip Trace Analysis</h3>
                <p className="text-center text-gray-400 font-mono text-sm h-6">
                    {SEARCH_STEPS[searchStep]}
                </p>
            </div>

            <div className="w-full max-w-md">
                <Progress value={progress} className="h-2 bg-dark-800" />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Processing request...</span>
                    <span>{progress}%</span>
                </div>
            </div>
        </motion.div>
    );
}

function RiskScoreBadge({ score }: { score: string }) {
    const style = RISK_STYLES[score] ?? RISK_STYLES.Medium;
    return (
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
            RISK SCORE: {score.toUpperCase()}
        </div>
    );
}

function OwnerProfileCard({ ownerData }: { ownerData: OwnerInfo }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#00F0FF]">
                <Building2 className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Owner Profile</h3>
            </div>

            <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-full">
                        <Contact className="w-4 h-4 text-gray-300" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Registered Owner</p>
                        <p className="font-semibold text-white">{ownerData.name}</p>
                        <p className="text-xs text-[#00F0FF]">{ownerData.type}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-full">
                        <MapPin className="w-4 h-4 text-gray-300" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Mailing Address</p>
                        <p className="text-sm text-gray-300">{ownerData.mailingAddress}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full bg-transparent border-white/10 hover:bg-white/5 text-xs h-8">
                        <Mail className="w-3 h-3 mr-2" />
                        Email
                    </Button>
                    <Button variant="outline" size="sm" className="w-full bg-transparent border-white/10 hover:bg-white/5 text-xs h-8">
                        <Phone className="w-3 h-3 mr-2" />
                        Phone
                    </Button>
                </div>
            </div>
        </div>
    );
}

function FinancialIntelCard({ ownerData }: { ownerData: OwnerInfo }) {
    const rows = [
        { label: "Acquisition Date", value: ownerData.acquisitionDate, color: "text-white" },
        { label: "Acquisition Price", value: `$${ownerData.acquisitionPrice.toLocaleString()}`, color: "text-white" },
        { label: "Est. Equity", value: `+$${ownerData.estimatedEquity.toLocaleString()}`, color: "text-green-400" },
        { label: "Linked Properties", value: `${ownerData.linkedProperties} Found`, color: "text-[#00F0FF]" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#A855F7]">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Financial Intel</h3>
            </div>

            <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5 space-y-3">
                {rows.map(({ label, value, color }, i) => (
                    <div
                        key={label}
                        className={`flex justify-between items-center py-1 ${i < rows.length - 1 ? "border-b border-white/5" : ""}`}
                    >
                        <span className="text-sm text-gray-400">{label}</span>
                        <span className={`text-sm font-mono ${color}`}>{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OwnerReport({ property, ownerData }: { property: Property; ownerData: OwnerInfo }) {
    return (
        <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="border-b border-white/10 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Ownership Intelligence Report</h2>
                        <p className="text-sm text-gray-400 font-mono">{property.formatted_address}</p>
                    </div>
                    <RiskScoreBadge score={ownerData.riskScore} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OwnerProfileCard ownerData={ownerData} />
                <FinancialIntelCard ownerData={ownerData} />
            </div>

            <div className="flex gap-3 pt-4">
                <Button disabled className="flex-1 bg-white/5 text-gray-400 border border-white/10">
                    Export PDF
                </Button>
                <Button className="flex-[2] bg-gradient-to-r from-[#00F0FF] to-[#A855F7] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white border-none font-bold">
                    <Phone className="w-4 h-4 mr-2" />
                    CONTACT OWNER NOW
                </Button>
            </div>

            <p className="text-[10px] text-center text-gray-600">
                CONFIDENTIAL: This report contains sensitive data derived from public records.
                Use in compliance with DPPA and GLBA regulations.
            </p>
        </motion.div>
    );
}

// --- Main component ---

export function OwnerDetailsModal({ property, isOpen, onClose }: OwnerDetailsModalProps) {
    const { loading, progress, searchStep, ownerData } = useSimulatedSearch(isOpen, property);

    if (!property) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-card border-[#00F0FF]/30 text-white max-w-2xl overflow-hidden neon-border">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <LoadingState progress={progress} searchStep={searchStep} />
                    ) : ownerData ? (
                        <OwnerReport property={property} ownerData={ownerData} />
                    ) : null}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
