"use client";

import { Property } from "@/lib/types";
import { PropertyCard } from "./PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useRef, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface PropertyListProps {
    properties: Property[];
    onAnalyzeOwner: (property: Property) => void;
    onHover: (id: string | null) => void;
}

// --- Constants ---

const CARD_HEIGHT_ESTIMATE = 340;
const HOVER_DEBOUNCE_MS = 80;
const COLUMNS = 2;

// --- Helpers ---

type SortComparator = (a: Property, b: Property) => number;

const SORT_COMPARATORS: Record<string, SortComparator> = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    sqft_desc: (a, b) => b.sqft - a.sqft,
    newest: (a, b) => new Date(b.list_date).getTime() - new Date(a.list_date).getTime(),
};

const SEARCH_FIELDS: (keyof Property)[] = ["formatted_address", "city", "zip_code", "street"];

function matchesSearch(property: Property, query: string): boolean {
    const q = query.toLowerCase();
    return SEARCH_FIELDS.some((field) =>
        String(property[field] ?? "").toLowerCase().includes(q)
    );
}

/** Chunk a flat array into rows of `cols` items each. */
function chunkIntoRows<T>(items: T[], cols: number): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += cols) {
        rows.push(items.slice(i, i + cols));
    }
    return rows;
}

// --- Sub-components ---

function EmptyState() {
    return (
        <div className="col-span-full py-20 text-center text-gray-500">
            <p>No se encontraron propiedades con ese criterio.</p>
        </div>
    );
}

// --- Main component ---

export function PropertyList({ properties, onAnalyzeOwner, onHover }: PropertyListProps) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("price_desc");
    const parentRef = useRef<HTMLDivElement>(null);

    const debouncedHover = useDebouncedCallback(onHover, HOVER_DEBOUNCE_MS);

    const filtered = useMemo(() => {
        const searched = search
            ? properties.filter((p) => matchesSearch(p, search))
            : properties;

        const comparator = SORT_COMPARATORS[sort];
        return comparator ? [...searched].sort(comparator) : searched;
    }, [properties, search, sort]);

    const rows = useMemo(() => chunkIntoRows(filtered, COLUMNS), [filtered]);

    // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer returns unstable refs by design; safe in this usage
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => CARD_HEIGHT_ESTIMATE,
        overscan: 3,
    });

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
        []
    );

    return (
        <div className="h-full flex flex-col glass-card border-none bg-black/20">
            <div className="p-4 space-y-3 border-b border-white/5 sticky top-0 bg-dark-900/95 backdrop-blur-md z-10">
                <div className="flex gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Buscar dirección, ciudad, código postal..."
                            className="pl-9 bg-white/5 border-white/10 focus:border-[#00F0FF] text-white placeholder:text-gray-600"
                            value={search}
                            onChange={handleSearchChange}
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

            <div
                ref={parentRef}
                className="flex-grow overflow-y-auto p-4 custom-scrollbar"
                style={{ contain: "strict" }}
            >
                {filtered.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: "100%",
                            position: "relative",
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            return (
                                <div
                                    key={virtualRow.key}
                                    data-index={virtualRow.index}
                                    ref={virtualizer.measureElement}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    {row.map((property) => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            onAnalyzeOwner={onAnalyzeOwner}
                                            onHover={debouncedHover}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Export for testing
export { matchesSearch, chunkIntoRows };
