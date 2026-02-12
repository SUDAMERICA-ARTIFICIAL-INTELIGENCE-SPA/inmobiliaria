"use client";

import { Property } from "@/lib/types";
import { PropertyCard } from "./PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface PropertyListProps {
    properties: Property[];
    onAnalyzeOwner: (property: Property) => void;
    onHover: (id: string | null) => void;
}

export function PropertyList({ properties, onAnalyzeOwner, onHover }: PropertyListProps) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("price_desc");

    const filtered = useMemo(() => {
        let result = [...properties];

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.formatted_address.toLowerCase().includes(q) ||
                    p.city?.toLowerCase().includes(q) ||
                    p.zip_code?.includes(q) ||
                    p.street?.toLowerCase().includes(q)
            );
        }

        switch (sort) {
            case "price_asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "sqft_desc":
                result.sort((a, b) => b.sqft - a.sqft);
                break;
            case "newest":
                result.sort((a, b) => (new Date(b.list_date).getTime() || 0) - (new Date(a.list_date).getTime() || 0));
                break;
        }

        return result;
    }, [properties, search, sort]);

    return (
        <div className="h-full flex flex-col glass-card border-none bg-black/20">
            {/* Filtros */}
            <div className="p-4 space-y-3 border-b border-white/5 sticky top-0 bg-dark-900/95 backdrop-blur-md z-10">
                <div className="flex gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Buscar dirección, ciudad, código postal..."
                            className="pl-9 bg-white/5 border-white/10 focus:border-[#00F0FF] text-white placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                            <SlidersHorizontal className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-800 border-white/10 text-white">
                            <SelectItem value="price_desc">Precio (Mayor)</SelectItem>
                            <SelectItem value="price_asc">Precio (Menor)</SelectItem>
                            <SelectItem value="newest">Más Recientes</SelectItem>
                            <SelectItem value="sqft_desc">Más Grandes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-xs text-gray-500 font-mono text-right">
                    Mostrando {filtered.length} de {properties.length} propiedades
                </div>
            </div>

            {/* Grid */}
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((property, index) => (
                        <div key={`${property.id}-${index}`} className="h-full">
                            <PropertyCard
                                property={property}
                                onAnalyzeOwner={onAnalyzeOwner}
                                onHover={onHover}
                            />
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            <p>No se encontraron propiedades con ese criterio.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
