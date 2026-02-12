"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Property, OwnerInfo } from "@/lib/types";
import { generateOwnerInfo } from "@/lib/mock-owners";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, BadgeCheck, Building2, Calendar, DollarSign, Contact, Mail, Phone, MapPin } from "lucide-react";

interface OwnerDetailsModalProps {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
}

export function OwnerDetailsModal({ property, isOpen, onClose }: OwnerDetailsModalProps) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [searchStep, setSearchStep] = useState(0);
    const [ownerData, setOwnerData] = useState<OwnerInfo | null>(null);

    const searchSteps = [
        "Searching Miami-Dade County Records...",
        "Cross-referencing tax assessor database...",
        "Analyzing ownership chain...",
        "Verifying LLC registration...",
        "Finalizing report..."
    ];

    useEffect(() => {
        if (isOpen && property) {
            setLoading(true);
            setProgress(0);
            setSearchStep(0);

            // Simulate progress and steps
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 40); // 2 seconds total

            const stepInterval = setInterval(() => {
                setSearchStep(prev => (prev < searchSteps.length - 1 ? prev + 1 : prev));
            }, 400);

            const timeout = setTimeout(() => {
                setOwnerData(generateOwnerInfo(property));
                setLoading(false);
            }, 2000);

            return () => {
                clearInterval(progressInterval);
                clearInterval(stepInterval);
                clearTimeout(timeout);
            };
        }
    }, [isOpen, property]);

    if (!property) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-card border-[#00F0FF]/30 text-white max-w-2xl overflow-hidden neon-border">
                <AnimatePresence mode="wait">
                    {loading ? (
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
                                    {searchSteps[searchStep]}
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
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Header */}
                            <div className="border-b border-white/10 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Ownership Intelligence Report</h2>
                                        <p className="text-sm text-gray-400 font-mono">{property.formatted_address}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${ownerData?.riskScore === "Low" ? "bg-green-500/20 border-green-500/50 text-green-400" :
                                            ownerData?.riskScore === "Medium" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
                                                "bg-red-500/20 border-red-500/50 text-red-500"
                                        }`}>
                                        RISK SCORE: {ownerData?.riskScore.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* Grid Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Owner Profile */}
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
                                                <p className="font-semibold text-white">{ownerData?.name}</p>
                                                <p className="text-xs text-[#00F0FF]">{ownerData?.type}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white/5 rounded-full">
                                                <MapPin className="w-4 h-4 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Mailing Address</p>
                                                <p className="text-sm text-gray-300">{ownerData?.mailingAddress}</p>
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

                                {/* Financial Intelligence */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[#A855F7]">
                                        <DollarSign className="w-5 h-5" />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Financial Intel</h3>
                                    </div>

                                    <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                                            <span className="text-sm text-gray-400">Acquisition Date</span>
                                            <span className="text-sm font-mono text-white">{ownerData?.acquisitionDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                                            <span className="text-sm text-gray-400">Acquisition Price</span>
                                            <span className="text-sm font-mono text-white">${ownerData?.acquisitionPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                                            <span className="text-sm text-gray-400">Est. Equity</span>
                                            <span className="text-sm font-mono text-green-400">+${ownerData?.estimatedEquity.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-400">Linked Properties</span>
                                            <span className="text-sm font-mono text-[#00F0FF]">{ownerData?.linkedProperties} Found</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="flex gap-3 pt-4">
                                <Button disabled className="flex-1 bg-white/5 text-gray-400 border border-white/10">
                                    Export PDF
                                </Button>
                                <Button className="flex-[2] bg-gradient-to-r from-[#00F0FF] to-[#A855F7] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white border-none font-bold">
                                    <Phone className="w-4 h-4 mr-2" />
                                    CONTACT OWNER NOW
                                </Button>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-[10px] text-center text-gray-600">
                                CONFIDENTIAL: This report contains sensitive data derived from public records.
                                Use in compliance with DPPA and GLBA regulations.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
