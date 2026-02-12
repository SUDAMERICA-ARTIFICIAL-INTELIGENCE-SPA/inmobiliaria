"use client";

import { DashboardStats } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Building2, DollarSign, TrendingDown, Clock } from "lucide-react";

interface StatsBarProps {
    stats: DashboardStats | null;
}

function formatPrice(value: number): string {
    return `US$ ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function StatsBar({ stats }: StatsBarProps) {
    if (!stats) return null;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
            {/* Total Propiedades */}
            <motion.div variants={item}>
                <Card className="glass-card p-6 border-t-2 border-t-[#00F0FF] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Propiedades Encontradas
                            </p>
                            <h3 className="text-3xl font-bold mt-2 text-[#00F0FF] neon-glow">
                                {stats.totalProperties}
                            </h3>
                        </div>
                        <div className="p-3 bg-[#00F0FF]/10 rounded-full">
                            <Building2 className="w-6 h-6 text-[#00F0FF]" />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Precio Promedio */}
            <motion.div variants={item}>
                <Card className="glass-card p-6 border-t-2 border-t-[#A855F7] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Precio Promedio
                            </p>
                            <h3 className="text-3xl font-bold mt-2 text-[#A855F7] neon-glow">
                                {formatPrice(stats.avgPrice)}
                            </h3>
                        </div>
                        <div className="p-3 bg-[#A855F7]/10 rounded-full">
                            <DollarSign className="w-6 h-6 text-[#A855F7]" />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Oportunidades */}
            <motion.div variants={item}>
                <Card className="glass-card p-6 border-t-2 border-t-[#FF006E] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF006E]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Oportunidades
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <h3 className="text-3xl font-bold text-[#FF006E] neon-glow">
                                    {stats.opportunities}
                                </h3>
                                <span className="text-[10px] bg-[#FF006E]/20 text-[#FF006E] px-2 py-0.5 rounded-full border border-[#FF006E]/30">
                                    BAJO MERCADO
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-[#FF006E]/10 rounded-full">
                            <TrendingDown className="w-6 h-6 text-[#FF006E]" />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Días Promedio en Mercado */}
            <motion.div variants={item}>
                <Card className="glass-card p-6 border-t-2 border-t-cyan-500 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Días Promedio en Mercado
                            </p>
                            <h3 className="text-3xl font-bold mt-2 text-cyan-500 neon-glow">
                                {stats.avgDaysOnMarket}
                            </h3>
                        </div>
                        <div className="p-3 bg-cyan-500/10 rounded-full">
                            <Clock className="w-6 h-6 text-cyan-500" />
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}
