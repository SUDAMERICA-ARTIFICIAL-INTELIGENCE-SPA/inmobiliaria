import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/lib/types";

vi.mock("framer-motion");

const mockProperty: Property = {
    id: "prop-1",
    url: "https://example.com",
    status: "for_sale",
    price: 750000,
    beds: 4,
    baths_full: 3,
    baths_half: 1,
    sqft: 2200,
    year_built: 2015,
    lot_sqft: 6000,
    style: "modern",
    property_type: "single_family",
    description: "Beautiful home",
    street: "456 Ocean Dr",
    unit: "",
    city: "Miami Beach",
    state: "FL",
    zip_code: "33139",
    formatted_address: "456 Ocean Dr, Miami Beach, FL 33139",
    latitude: 25.79,
    longitude: -80.13,
    primary_photo: "https://example.com/photo.jpg",
    photos: [],
    agent_name: "Jane Smith",
    agent_phone: "305-555-0200",
    agent_email: "jane@example.com",
    days_on_mls: 20,
    price_per_sqft: 340,
    hoa_fee: 500,
    list_date: "2024-06-01",
    neighborhoods: "South Beach",
    stories: 2,
    garage: 2,
};

describe("PropertyCard", () => {
    it("renders property price", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("US$ 750,000")).toBeInTheDocument();
    });

    it("renders street address", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("456 Ocean Dr")).toBeInTheDocument();
    });

    it("renders city, state and zip", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("Miami Beach, FL 33139")).toBeInTheDocument();
    });

    it("renders beds count", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("renders baths (full + half)", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("3.5")).toBeInTheDocument();
    });

    it("renders square footage", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText(/2,?200\s*sqft/)).toBeInTheDocument();
    });

    it("renders year built", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("2015")).toBeInTheDocument();
    });

    it("renders days on market", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("20 Días en Mercado")).toBeInTheDocument();
    });

    it("shows EN VENTA for for_sale status", () => {
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("EN VENTA")).toBeInTheDocument();
    });

    it("shows VENDIDO for sold status", () => {
        const soldProp = { ...mockProperty, status: "sold" };
        render(<PropertyCard property={soldProp} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("VENDIDO")).toBeInTheDocument();
    });

    it("shows PENDIENTE for pending status", () => {
        const pendingProp = { ...mockProperty, status: "pending" };
        render(<PropertyCard property={pendingProp} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("PENDIENTE")).toBeInTheDocument();
    });

    it("calls onAnalyzeOwner when card is clicked", () => {
        const handler = vi.fn();
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={handler} />);
        const card = screen.getByText("456 Ocean Dr").closest("[class*='cursor-pointer']");
        if (card) fireEvent.click(card);
        expect(handler).toHaveBeenCalledWith(mockProperty);
    });

    it("calls onHover with property id on mouse enter", () => {
        const hoverHandler = vi.fn();
        render(<PropertyCard property={mockProperty} onAnalyzeOwner={vi.fn()} onHover={hoverHandler} />);
        const card = screen.getByText("456 Ocean Dr").closest("[class*='h-full']");
        if (card) fireEvent.mouseEnter(card);
        expect(hoverHandler).toHaveBeenCalledWith("prop-1");
    });

    it("renders N/A when year_built is null", () => {
        const noYear = { ...mockProperty, year_built: null };
        render(<PropertyCard property={noYear} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("shows fallback image when primary_photo is null", () => {
        const noPhoto = { ...mockProperty, primary_photo: "" };
        render(<PropertyCard property={noPhoto} onAnalyzeOwner={vi.fn()} />);
        expect(screen.getByText("Sin Imagen")).toBeInTheDocument();
    });
});
