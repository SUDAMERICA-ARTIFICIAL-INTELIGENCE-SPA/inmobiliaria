"use client";

import { useState, useEffect } from "react";
import { Property, DashboardStats } from "@/lib/types";

// --- Helpers (pure, testable) ---

function deduplicateById(data: Property[]): Property[] {
    const seen = new Set<string>();
    return data.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });
}

function calculateMedian(sorted: number[]): number {
    const len = sorted.length;
    if (len === 0) return 0;
    const mid = Math.floor(len / 2);
    if (len % 2 !== 0) return sorted[mid];
    return (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStats(properties: Property[]): DashboardStats {
    const validProps = properties.filter((p) => p.price > 0);
    const total = validProps.length;

    if (total === 0) {
        return { totalProperties: 0, avgPrice: 0, medianPrice: 0, opportunities: 0, avgDaysOnMarket: 0, totalValue: 0 };
    }

    const totalPrice = validProps.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = totalPrice / total;

    const sortedPrices = validProps.map((p) => p.price).sort((a, b) => a - b);
    const medianPrice = calculateMedian(sortedPrices);

    const avgPps = validProps.reduce((sum, p) => sum + (p.price_per_sqft || 0), 0) / total;
    const opportunities = validProps.filter(
        (p) => p.price_per_sqft > 0 && p.price_per_sqft < avgPps * 0.8
    ).length;

    const avgDom = validProps.reduce((sum, p) => sum + (p.days_on_mls || 0), 0) / total;

    return {
        totalProperties: total,
        avgPrice,
        medianPrice,
        opportunities,
        avgDaysOnMarket: Math.round(avgDom),
        totalValue: totalPrice,
    };
}

// --- Hook ---

export function useProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProperties() {
            try {
                const response = await fetch("/data/properties.json");
                if (!response.ok) throw new Error("Failed to fetch properties");

                const data: Property[] = await response.json();
                const unique = deduplicateById(data);

                setProperties(unique);
                setStats(calculateStats(unique));
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProperties();
    }, []);

    return { properties, stats, isLoading, error };
}
