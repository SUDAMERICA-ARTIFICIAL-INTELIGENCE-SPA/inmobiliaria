import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PropertyList, matchesSearch, chunkIntoRows } from "./PropertyList";
import { Property } from "@/lib/types";

vi.mock("framer-motion");

// Mock @tanstack/react-virtual to avoid needing real scroll container measurements
vi.mock("@tanstack/react-virtual", () => ({
    useVirtualizer: ({ count }: { count: number }) => ({
        getTotalSize: () => count * 340,
        getVirtualItems: () =>
            Array.from({ length: count }, (_, i) => ({
                index: i,
                key: i,
                start: i * 340,
                size: 340,
            })),
        measureElement: () => {},
    }),
}));

function makeProperty(id: string, overrides: Partial<Property> = {}): Property {
    return {
        id,
        url: "",
        status: "for_sale",
        price: 500000,
        beds: 3,
        baths_full: 2,
        baths_half: 0,
        sqft: 1500,
        year_built: 2010,
        lot_sqft: 5000,
        style: "",
        property_type: "single_family",
        description: "",
        street: `${id} Test St`,
        unit: "",
        city: "Miami",
        state: "FL",
        zip_code: "33131",
        formatted_address: `${id} Test St, Miami, FL 33131`,
        latitude: 25.76,
        longitude: -80.19,
        primary_photo: "",
        photos: [],
        agent_name: "",
        agent_phone: "",
        agent_email: "",
        days_on_mls: 10,
        price_per_sqft: 333,
        hoa_fee: 0,
        list_date: "2024-01-01",
        neighborhoods: "",
        stories: 1,
        garage: 1,
        ...overrides,
    };
}

const properties = [
    makeProperty("1", { street: "100 Brickell Ave", city: "Miami", formatted_address: "100 Brickell Ave, Miami, FL 33131", price: 800000 }),
    makeProperty("2", { street: "200 Collins Ave", city: "Miami Beach", formatted_address: "200 Collins Ave, Miami Beach, FL 33139", price: 400000 }),
    makeProperty("3", { street: "300 Coral Way", city: "Coral Gables", formatted_address: "300 Coral Way, Coral Gables, FL 33134", price: 600000, zip_code: "33134" }),
];

describe("PropertyList", () => {
    it("renders all properties", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        expect(screen.getByText("100 Brickell Ave")).toBeInTheDocument();
        expect(screen.getByText("200 Collins Ave")).toBeInTheDocument();
        expect(screen.getByText("300 Coral Way")).toBeInTheDocument();
    });

    it("shows property count", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        expect(screen.getByText(/Mostrando 3 de 3 propiedades/)).toBeInTheDocument();
    });

    it("filters by search query", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const input = screen.getByPlaceholderText(/Buscar/);
        fireEvent.change(input, { target: { value: "Brickell" } });
        expect(screen.getByText("100 Brickell Ave")).toBeInTheDocument();
        expect(screen.queryByText("200 Collins Ave")).not.toBeInTheDocument();
        expect(screen.getByText(/Mostrando 1 de 3/)).toBeInTheDocument();
    });

    it("filters by city", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const input = screen.getByPlaceholderText(/Buscar/);
        fireEvent.change(input, { target: { value: "Coral Gables" } });
        expect(screen.getByText("300 Coral Way")).toBeInTheDocument();
        expect(screen.queryByText("100 Brickell Ave")).not.toBeInTheDocument();
    });

    it("filters by zip code", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const input = screen.getByPlaceholderText(/Buscar/);
        fireEvent.change(input, { target: { value: "33134" } });
        expect(screen.getByText("300 Coral Way")).toBeInTheDocument();
    });

    it("shows empty state when no results match", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const input = screen.getByPlaceholderText(/Buscar/);
        fireEvent.change(input, { target: { value: "nonexistent" } });
        expect(screen.getByText("No se encontraron propiedades con ese criterio.")).toBeInTheDocument();
    });

    it("renders search input", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        expect(screen.getByPlaceholderText(/Buscar/)).toBeInTheDocument();
    });

    it("sorts by price ascending (price_asc)", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const select = screen.getByRole("combobox");
        fireEvent.click(select);
        fireEvent.click(screen.getByText("Precio (Menor)"));

        const cards = screen.getAllByText(/Ave|Way/);
        expect(cards[0].textContent).toContain("Collins");
        expect(cards[1].textContent).toContain("Coral");
        expect(cards[2].textContent).toContain("Brickell");
    });

    it("sorts by price descending (price_desc) — default", () => {
        render(<PropertyList properties={properties} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const cards = screen.getAllByText(/Ave|Way/);
        expect(cards[0].textContent).toContain("Brickell");
        expect(cards[1].textContent).toContain("Coral");
        expect(cards[2].textContent).toContain("Collins");
    });

    it("sorts by sqft descending (sqft_desc)", () => {
        const props = [
            makeProperty("a", { street: "Small St", sqft: 800, price: 100000 }),
            makeProperty("b", { street: "Big St", sqft: 3000, price: 200000 }),
            makeProperty("c", { street: "Mid St", sqft: 1500, price: 150000 }),
        ];
        render(<PropertyList properties={props} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const select = screen.getByRole("combobox");
        fireEvent.click(select);
        fireEvent.click(screen.getByText("Más Grandes"));

        const cards = screen.getAllByText(/St/);
        expect(cards[0].textContent).toContain("Big");
        expect(cards[1].textContent).toContain("Mid");
        expect(cards[2].textContent).toContain("Small");
    });

    it("sorts by newest (list_date descending)", () => {
        const props = [
            makeProperty("x", { street: "Old Rd", list_date: "2023-01-01", price: 100000 }),
            makeProperty("y", { street: "New Rd", list_date: "2025-06-15", price: 200000 }),
            makeProperty("z", { street: "Mid Rd", list_date: "2024-06-01", price: 150000 }),
        ];
        render(<PropertyList properties={props} onAnalyzeOwner={vi.fn()} onHover={vi.fn()} />);
        const select = screen.getByRole("combobox");
        fireEvent.click(select);
        fireEvent.click(screen.getByText("Más Recientes"));

        const cards = screen.getAllByText(/Rd/);
        expect(cards[0].textContent).toContain("New");
        expect(cards[1].textContent).toContain("Mid");
        expect(cards[2].textContent).toContain("Old");
    });
});

describe("matchesSearch", () => {
    const prop = makeProperty("1", {
        formatted_address: "100 Brickell Ave, Miami, FL 33131",
        city: "Miami",
        zip_code: "33131",
        street: "100 Brickell Ave",
    });

    it("should match by street", () => {
        expect(matchesSearch(prop, "Brickell")).toBe(true);
    });

    it("should match by city", () => {
        expect(matchesSearch(prop, "Miami")).toBe(true);
    });

    it("should match by zip code", () => {
        expect(matchesSearch(prop, "33131")).toBe(true);
    });

    it("should match case-insensitively", () => {
        expect(matchesSearch(prop, "brickell")).toBe(true);
        expect(matchesSearch(prop, "MIAMI")).toBe(true);
    });

    it("should return false for non-matching query", () => {
        expect(matchesSearch(prop, "nonexistent")).toBe(false);
    });

    it("should match by formatted_address", () => {
        expect(matchesSearch(prop, "100 Brickell")).toBe(true);
    });

    it("should handle empty query", () => {
        expect(matchesSearch(prop, "")).toBe(true);
    });
});

describe("chunkIntoRows", () => {
    it("should return empty array for empty input", () => {
        expect(chunkIntoRows([], 2)).toEqual([]);
    });

    it("should chunk items into rows of specified size", () => {
        const result = chunkIntoRows([1, 2, 3, 4], 2);
        expect(result).toEqual([[1, 2], [3, 4]]);
    });

    it("should handle last row with fewer items", () => {
        const result = chunkIntoRows([1, 2, 3], 2);
        expect(result).toEqual([[1, 2], [3]]);
    });

    it("should handle single item", () => {
        const result = chunkIntoRows(["a"], 2);
        expect(result).toEqual([["a"]]);
    });

    it("should handle chunk size of 1", () => {
        const result = chunkIntoRows([1, 2, 3], 1);
        expect(result).toEqual([[1], [2], [3]]);
    });

    it("should handle chunk size larger than array", () => {
        const result = chunkIntoRows([1, 2], 5);
        expect(result).toEqual([[1, 2]]);
    });
});
