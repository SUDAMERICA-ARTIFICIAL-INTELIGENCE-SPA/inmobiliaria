import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PropertyDetailSheet } from "./PropertyDetailSheet";
import { Property } from "@/lib/types";

vi.mock("framer-motion");

const mockProperty: Property = {
    id: "sheet-1",
    url: "https://example.com/listing",
    status: "for_sale",
    price: 950000,
    beds: 5,
    baths_full: 4,
    baths_half: 1,
    sqft: 3500,
    year_built: 2018,
    lot_sqft: 8000,
    style: "contemporary",
    property_type: "single_family",
    description: "Stunning waterfront property with panoramic views.",
    street: "789 Bay Rd",
    unit: "PH-A",
    city: "Miami Beach",
    state: "FL",
    zip_code: "33141",
    formatted_address: "789 Bay Rd PH-A, Miami Beach, FL 33141",
    latitude: 25.85,
    longitude: -80.12,
    primary_photo: "https://example.com/photo.jpg",
    photos: [],
    agent_name: "Bob Agent",
    agent_phone: "305-555-0300",
    agent_email: "bob@example.com",
    days_on_mls: 5,
    price_per_sqft: 271,
    hoa_fee: 800,
    list_date: "2024-07-01",
    neighborhoods: "North Beach",
    stories: 3,
    garage: 2,
};

describe("PropertyDetailSheet", () => {
    it("renders null when property is null", () => {
        const { container } = render(
            <PropertyDetailSheet property={null} isOpen={true} onClose={vi.fn()} />
        );
        expect(container.innerHTML).toBe("");
    });

    it("renders property price when open", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("US$ 950,000")).toBeInTheDocument();
    });

    it("renders property address", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("789 Bay Rd, PH-A")).toBeInTheDocument();
    });

    it("renders beds count", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders baths (full + half)", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    it("renders sqft formatted", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText(/3,?500/)).toBeInTheDocument();
    });

    it("renders owner section", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("Propietario Detectado")).toBeInTheDocument();
    });

    it("renders unlock button", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("DESBLOQUEAR CONTACTO")).toBeInTheDocument();
    });

    it("unlocks contact on button click", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        fireEvent.click(screen.getByText("DESBLOQUEAR CONTACTO"));
        expect(screen.getByText(/Contacto desbloqueado/)).toBeInTheDocument();
    });

    it("renders description when available", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText(/Stunning waterfront/)).toBeInTheDocument();
    });

    it("renders external link button when url exists", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("Ver Fuente Original")).toBeInTheDocument();
    });

    it("renders sheet title for accessibility", () => {
        render(<PropertyDetailSheet property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("Detalles de la Propiedad")).toBeInTheDocument();
    });
});
