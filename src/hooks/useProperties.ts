"use client";

import { useState, useEffect } from "react";
import { Property, DashboardStats } from "@/lib/types";

export function useProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProperties() {
            try {
                const response = await fetch("/data/properties.json");
                if (!response.ok) {
                    throw new Error("Failed to fetch properties");
                }
                const data: Property[] = await response.json();

                // Deduplicate by ID — keep first occurrence
                const uniqueData = data.filter(
                    (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i
                );

                // Calculate Stats
                const validProps = uniqueData.filter((p) => p.price > 0);
                const total = validProps.length;
                const totalPrice = validProps.reduce((sum, p) => sum + p.price, 0);
                const avgPrice = total > 0 ? totalPrice / total : 0;

                // Median Price
                const sortedPrices = validProps.map((p) => p.price).sort((a, b) => a - b);
                const medianPrice =
                    total > 0
                        ? total % 2 !== 0
                            ? sortedPrices[Math.floor(total / 2)]
                            : (sortedPrices[total / 2 - 1] + sortedPrices[total / 2]) / 2
                        : 0;

                // Identify Opportunities (price_per_sqft < 80% of avg price_per_sqft)
                const avgPps =
                    validProps.reduce((sum, p) => sum + (p.price_per_sqft || 0), 0) /
                    total;
                const opportunities = validProps.filter(
                    (p) => p.price_per_sqft > 0 && p.price_per_sqft < avgPps * 0.8
                ).length;

                // Avg Days on Market
                const avgDom =
                    validProps.reduce((sum, p) => sum + (p.days_on_mls || 0), 0) /
                    total;

                setProperties(uniqueData);
                setStats({
                    totalProperties: total,
                    avgPrice,
                    medianPrice,
                    opportunities,
                    avgDaysOnMarket: Math.round(avgDom),
                    totalValue: totalPrice,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProperties();
    }, []);

    return { properties, stats, isLoading, error };
}
