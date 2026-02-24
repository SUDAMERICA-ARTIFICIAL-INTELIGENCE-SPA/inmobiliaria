"use client";

import { DashboardStats } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";
import { Building2, DollarSign, TrendingDown, Clock, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface StatsBarProps {
    stats: DashboardStats | null;
}

interface StatCardProps {
    label: string;
    value: ReactNode;
    color: string;
    icon: LucideIcon;
    variants: Variants;
}

function StatCard({ label, value, color, icon: Icon, variants }: StatCardProps) {
    return (
        <motion.div variants={variants}>
            <Card className={`glass-card p-6 border-t-2 relative overflow-hidden group`} style={{ borderTopColor: color }}>
                <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to bottom right, ${color}1A, transparent)` }} />
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {label}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <h3 className="text-3xl font-bold neon-glow" style={{ color }}>
                                {value}
                            </h3>
                        </div>
                    </div>
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${color}1A` }}>
                        <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
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
            <StatCard label="Propiedades Encontradas" value={stats.totalProperties} color="#00F0FF" icon={Building2} variants={item} />
            <StatCard label="Precio Promedio" value={formatPrice(stats.avgPrice)} color="#A855F7" icon={DollarSign} variants={item} />
            <StatCard
                label="Oportunidades"
                color="#FF006E"
                icon={TrendingDown}
                variants={item}
                value={
                    <>
                        {stats.opportunities}
                        <span className="text-[10px] bg-[#FF006E]/20 text-[#FF006E] px-2 py-0.5 rounded-full border border-[#FF006E]/30">
                            BAJO MERCADO
                        </span>
                    </>
                }
            />
            <StatCard label="Días Promedio en Mercado" value={stats.avgDaysOnMarket} color="#06b6d4" icon={Clock} variants={item} />
        </motion.div>
    );
}
