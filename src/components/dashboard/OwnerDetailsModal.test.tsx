import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { OwnerDetailsModal } from "./OwnerDetailsModal";
import { Property } from "@/lib/types";

vi.mock("framer-motion");

const mockProperty: Property = {
    id: "modal-1",
    url: "https://example.com",
    status: "for_sale",
    price: 680000,
    beds: 3,
    baths_full: 2,
    baths_half: 0,
    sqft: 1900,
    year_built: 2012,
    lot_sqft: 4500,
    style: "",
    property_type: "condo",
    description: "",
    street: "500 Brickell Key Dr",
    unit: "1205",
    city: "Miami",
    state: "FL",
    zip_code: "33131",
    formatted_address: "500 Brickell Key Dr #1205, Miami, FL 33131",
    latitude: 25.77,
    longitude: -80.18,
    primary_photo: "",
    photos: [],
    agent_name: "",
    agent_phone: "",
    agent_email: "",
    days_on_mls: 45,
    price_per_sqft: 357,
    hoa_fee: 600,
    list_date: "2024-03-15",
    neighborhoods: "Brickell Key",
    stories: 1,
    garage: 1,
};

describe("OwnerDetailsModal", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders null when property is null", () => {
        const { container } = render(
            <OwnerDetailsModal property={null} isOpen={true} onClose={vi.fn()} />
        );
        expect(container.innerHTML).toBe("");
    });

    it("renders loading state initially when open", () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("Skip Trace Analysis")).toBeInTheDocument();
    });

    it("renders search steps during loading", () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("Searching Miami-Dade County Records...")).toBeInTheDocument();
    });

    it("renders progress bar area", () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("Processing request...")).toBeInTheDocument();
    });

    it("shows progress percentage", () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("shows owner report after loading completes", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText("Ownership Intelligence Report")).toBeInTheDocument();
    });

    it("shows property address in the report", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText(mockProperty.formatted_address)).toBeInTheDocument();
    });

    it("shows owner profile section after loading", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText("Owner Profile")).toBeInTheDocument();
    });

    it("shows financial intel section after loading", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText("Financial Intel")).toBeInTheDocument();
    });

    it("shows risk score badge after loading", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText(/RISK SCORE/)).toBeInTheDocument();
    });

    it("shows contact owner button after loading", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText("CONTACT OWNER NOW")).toBeInTheDocument();
    });

    it("shows confidential disclaimer after loading", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText(/CONFIDENTIAL/)).toBeInTheDocument();
    });

    it("shows registered owner label", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText("Registered Owner")).toBeInTheDocument();
    });

    it("shows mailing address label", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText("Mailing Address")).toBeInTheDocument();
    });

    it("shows acquisition date in financial intel", async () => {
        render(<OwnerDetailsModal property={mockProperty} isOpen={true} onClose={vi.fn()} />);

        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        expect(screen.getByText("Acquisition Date")).toBeInTheDocument();
    });
});
