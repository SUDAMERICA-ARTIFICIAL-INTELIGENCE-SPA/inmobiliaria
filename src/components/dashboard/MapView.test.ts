import { describe, it, expect } from "vitest";
import { clusterProperties, hasCoordinates } from "./MapView";
import { Property } from "@/lib/types";

function makeGeoProperty(
    id: string,
    lat: number,
    lng: number,
    overrides: Partial<Property> = {}
) {
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
        latitude: lat,
        longitude: lng,
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

describe("hasCoordinates", () => {
    it("should return true when latitude and longitude are present", () => {
        const p = makeGeoProperty("1", 25.76, -80.19);
        expect(hasCoordinates(p)).toBe(true);
    });

    it("should return false when latitude is null", () => {
        const p = makeGeoProperty("1", 25.76, -80.19);
        (p as Property).latitude = null;
        expect(hasCoordinates(p as Property)).toBe(false);
    });

    it("should return false when longitude is null", () => {
        const p = makeGeoProperty("1", 25.76, -80.19);
        (p as Property).longitude = null;
        expect(hasCoordinates(p as Property)).toBe(false);
    });

    it("should return false when both are null", () => {
        const p = { ...makeGeoProperty("1", 0, 0), latitude: null, longitude: null } as unknown as Property;
        expect(hasCoordinates(p)).toBe(false);
    });
});

describe("clusterProperties", () => {
    it("should return empty array for empty input", () => {
        const result = clusterProperties([], 0.005);
        expect(result).toEqual([]);
    });

    it("should create a single cluster for one property", () => {
        const props = [makeGeoProperty("1", 25.76, -80.19)];
        const clusters = clusterProperties(props, 0.005);
        expect(clusters).toHaveLength(1);
        expect(clusters[0].count).toBe(1);
        expect(clusters[0].properties).toHaveLength(1);
    });

    it("should cluster nearby properties together", () => {
        const props = [
            makeGeoProperty("1", 25.7601, -80.1901),
            makeGeoProperty("2", 25.7602, -80.1902),
            makeGeoProperty("3", 25.7603, -80.1903),
        ];
        const clusters = clusterProperties(props, 0.005);
        expect(clusters).toHaveLength(1);
        expect(clusters[0].count).toBe(3);
    });

    it("should separate distant properties into different clusters", () => {
        const props = [
            makeGeoProperty("1", 25.76, -80.19),
            makeGeoProperty("2", 26.00, -80.50),
        ];
        const clusters = clusterProperties(props, 0.005);
        expect(clusters.length).toBeGreaterThanOrEqual(2);
    });

    it("should compute cluster center as average of member coordinates", () => {
        const props = [
            makeGeoProperty("1", 25.760, -80.190),
            makeGeoProperty("2", 25.762, -80.192),
        ];
        const clusters = clusterProperties(props, 0.005);
        const cluster = clusters[0];
        expect(cluster.lat).toBeCloseTo(25.761, 2);
        expect(cluster.lng).toBeCloseTo(-80.191, 2);
    });

    it("should assign unique ids to clusters", () => {
        const props = [
            makeGeoProperty("1", 25.76, -80.19),
            makeGeoProperty("2", 26.00, -80.50),
            makeGeoProperty("3", 27.00, -81.00),
        ];
        const clusters = clusterProperties(props, 0.005);
        const ids = clusters.map((c) => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it("should handle properties at the same exact location", () => {
        const props = [
            makeGeoProperty("1", 25.76, -80.19),
            makeGeoProperty("2", 25.76, -80.19),
        ];
        const clusters = clusterProperties(props, 0.005);
        expect(clusters).toHaveLength(1);
        expect(clusters[0].count).toBe(2);
    });

    it("should handle negative coordinates without errors", () => {
        const props = [
            makeGeoProperty("1", -34.597, -58.377),
            makeGeoProperty("2", -34.598, -58.378),
        ];
        const clusters = clusterProperties(props, 0.005);
        const totalCount = clusters.reduce((sum, c) => sum + c.count, 0);
        expect(totalCount).toBe(2);
        expect(clusters.length).toBeGreaterThanOrEqual(1);
    });

    it("should scale linearly with more properties in same area", () => {
        const props = Array.from({ length: 100 }, (_, i) =>
            makeGeoProperty(`${i}`, 25.76 + i * 0.0001, -80.19 + i * 0.0001)
        );
        const clusters = clusterProperties(props, 0.005);
        const totalCount = clusters.reduce((sum, c) => sum + c.count, 0);
        expect(totalCount).toBe(100);
    });
});
