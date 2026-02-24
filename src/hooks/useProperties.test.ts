import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { deduplicateById, calculateMedian, calculateStats, useProperties } from "./useProperties";
import { Property } from "@/lib/types";

function makeProperty(overrides: Partial<Property> = {}): Property {
    return {
        id: "1",
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
        street: "123 Main St",
        unit: "",
        city: "Miami",
        state: "FL",
        zip_code: "33131",
        formatted_address: "123 Main St, Miami, FL 33131",
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

describe("deduplicateById", () => {
    it("removes duplicate properties by id", () => {
        const props = [
            makeProperty({ id: "1" }),
            makeProperty({ id: "2" }),
            makeProperty({ id: "1" }),
        ];
        const result = deduplicateById(props);
        expect(result).toHaveLength(2);
        expect(result.map((p) => p.id)).toEqual(["1", "2"]);
    });

    it("returns empty array for empty input", () => {
        expect(deduplicateById([])).toEqual([]);
    });

    it("keeps order of first occurrence", () => {
        const props = [
            makeProperty({ id: "b" }),
            makeProperty({ id: "a" }),
            makeProperty({ id: "c" }),
            makeProperty({ id: "a" }),
        ];
        const result = deduplicateById(props);
        expect(result.map((p) => p.id)).toEqual(["b", "a", "c"]);
    });

    it("handles single element", () => {
        const result = deduplicateById([makeProperty({ id: "only" })]);
        expect(result).toHaveLength(1);
    });
});

describe("calculateMedian", () => {
    it("returns 0 for empty array", () => {
        expect(calculateMedian([])).toBe(0);
    });

    it("returns middle value for odd-length array", () => {
        expect(calculateMedian([1, 2, 3])).toBe(2);
    });

    it("returns average of two middle values for even-length array", () => {
        expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    });

    it("returns the single value for length-1 array", () => {
        expect(calculateMedian([42])).toBe(42);
    });

    it("works with large numbers", () => {
        expect(calculateMedian([100000, 200000, 300000])).toBe(200000);
    });
});

describe("calculateStats", () => {
    it("returns zeroed stats for empty array", () => {
        const stats = calculateStats([]);
        expect(stats.totalProperties).toBe(0);
        expect(stats.avgPrice).toBe(0);
        expect(stats.medianPrice).toBe(0);
        expect(stats.opportunities).toBe(0);
        expect(stats.avgDaysOnMarket).toBe(0);
        expect(stats.totalValue).toBe(0);
    });

    it("returns zeroed stats when all prices are 0", () => {
        const stats = calculateStats([makeProperty({ price: 0 })]);
        expect(stats.totalProperties).toBe(0);
    });

    it("calculates total properties correctly", () => {
        const props = [
            makeProperty({ id: "1", price: 300000 }),
            makeProperty({ id: "2", price: 500000 }),
            makeProperty({ id: "3", price: 700000 }),
        ];
        const stats = calculateStats(props);
        expect(stats.totalProperties).toBe(3);
    });

    it("calculates average price", () => {
        const props = [
            makeProperty({ id: "1", price: 300000 }),
            makeProperty({ id: "2", price: 600000 }),
        ];
        const stats = calculateStats(props);
        expect(stats.avgPrice).toBe(450000);
    });

    it("calculates median price", () => {
        const props = [
            makeProperty({ id: "1", price: 100000 }),
            makeProperty({ id: "2", price: 200000 }),
            makeProperty({ id: "3", price: 900000 }),
        ];
        const stats = calculateStats(props);
        expect(stats.medianPrice).toBe(200000);
    });

    it("calculates total value", () => {
        const props = [
            makeProperty({ id: "1", price: 100000 }),
            makeProperty({ id: "2", price: 200000 }),
        ];
        const stats = calculateStats(props);
        expect(stats.totalValue).toBe(300000);
    });

    it("identifies opportunities (below 80% avg price_per_sqft)", () => {
        const props = [
            makeProperty({ id: "1", price: 500000, price_per_sqft: 400 }),
            makeProperty({ id: "2", price: 500000, price_per_sqft: 400 }),
            makeProperty({ id: "3", price: 200000, price_per_sqft: 100 }),
        ];
        const stats = calculateStats(props);
        expect(stats.opportunities).toBeGreaterThanOrEqual(1);
    });

    it("counts zero opportunities when all price_per_sqft are equal", () => {
        const props = [
            makeProperty({ id: "1", price: 500000, price_per_sqft: 300 }),
            makeProperty({ id: "2", price: 500000, price_per_sqft: 300 }),
        ];
        const stats = calculateStats(props);
        expect(stats.opportunities).toBe(0);
    });

    it("rounds average days on market", () => {
        const props = [
            makeProperty({ id: "1", days_on_mls: 10 }),
            makeProperty({ id: "2", days_on_mls: 15 }),
        ];
        const stats = calculateStats(props);
        expect(stats.avgDaysOnMarket).toBe(13);
    });

    it("handles properties with 0 days_on_mls", () => {
        const props = [
            makeProperty({ id: "1", days_on_mls: 0 }),
            makeProperty({ id: "2", days_on_mls: 20 }),
        ];
        const stats = calculateStats(props);
        expect(stats.avgDaysOnMarket).toBe(10);
    });
});

describe("useProperties hook", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("starts with loading true", () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([]),
        });

        const { result } = renderHook(() => useProperties());
        expect(result.current.isLoading).toBe(true);
        expect(result.current.properties).toEqual([]);
    });

    it("fetches and sets properties", async () => {
        const mockData = [
            makeProperty({ id: "1", price: 300000 }),
            makeProperty({ id: "2", price: 500000 }),
        ];

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        const { result } = renderHook(() => useProperties());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.properties).toHaveLength(2);
        expect(result.current.stats).not.toBeNull();
        expect(result.current.error).toBeNull();
    });

    it("deduplicates fetched properties", async () => {
        const mockData = [
            makeProperty({ id: "1" }),
            makeProperty({ id: "1" }),
            makeProperty({ id: "2" }),
        ];

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        const { result } = renderHook(() => useProperties());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.properties).toHaveLength(2);
    });

    it("sets error on fetch failure", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: false,
        });

        const { result } = renderHook(() => useProperties());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Failed to fetch properties");
        expect(result.current.properties).toEqual([]);
    });

    it("sets error on network error", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new Error("Network error")
        );

        const { result } = renderHook(() => useProperties());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Network error");
    });

    it("handles non-Error exceptions", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce("string error");

        const { result } = renderHook(() => useProperties());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Unknown error");
    });

    it("calculates stats from fetched data", async () => {
        const mockData = [
            makeProperty({ id: "1", price: 300000, price_per_sqft: 200, days_on_mls: 10 }),
            makeProperty({ id: "2", price: 600000, price_per_sqft: 400, days_on_mls: 20 }),
        ];

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        const { result } = renderHook(() => useProperties());

        await waitFor(() => {
            expect(result.current.stats).not.toBeNull();
        });

        expect(result.current.stats!.totalProperties).toBe(2);
        expect(result.current.stats!.avgPrice).toBe(450000);
        expect(result.current.stats!.totalValue).toBe(900000);
    });
});
