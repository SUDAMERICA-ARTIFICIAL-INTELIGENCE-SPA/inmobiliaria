import { describe, it, expect } from "vitest";
import { generateOwnerInfo, seededRandom, weightedPick } from "./mock-owners";
import { Property } from "./types";

function makeProperty(overrides: Partial<Property> = {}): Property {
    return {
        id: "test-123",
        url: "https://example.com",
        status: "for_sale",
        price: 500000,
        beds: 3,
        baths_full: 2,
        baths_half: 1,
        sqft: 1800,
        year_built: 2005,
        lot_sqft: 5000,
        style: "modern",
        property_type: "single_family",
        description: "A beautiful home",
        street: "123 Main St",
        unit: "",
        city: "Miami",
        state: "FL",
        zip_code: "33131",
        formatted_address: "123 Main St, Miami, FL 33131",
        latitude: 25.76,
        longitude: -80.19,
        primary_photo: "https://example.com/photo.jpg",
        photos: [],
        agent_name: "John Doe",
        agent_phone: "305-555-0100",
        agent_email: "john@example.com",
        days_on_mls: 30,
        price_per_sqft: 277,
        hoa_fee: 0,
        list_date: "2024-01-01",
        neighborhoods: "Downtown",
        stories: 1,
        garage: 2,
        ...overrides,
    };
}

describe("seededRandom", () => {
    it("returns deterministic values for same seed", () => {
        const rng1 = seededRandom("test");
        const rng2 = seededRandom("test");
        expect(rng1()).toBe(rng2());
        expect(rng1()).toBe(rng2());
    });

    it("returns different values for different seeds", () => {
        const rng1 = seededRandom("seed-a");
        const rng2 = seededRandom("seed-b");
        expect(rng1()).not.toBe(rng2());
    });

    it("returns values between 0 and 1", () => {
        const rng = seededRandom("range-test");
        for (let i = 0; i < 100; i++) {
            const val = rng();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(1);
        }
    });
});

describe("weightedPick", () => {
    it("picks the first option when roll is below first weight", () => {
        expect(weightedPick(["a", "b", "c"], [0.5, 0.3, 0.2], 0.1)).toBe("a");
    });

    it("picks the second option when roll is between first and second weight", () => {
        expect(weightedPick(["a", "b", "c"], [0.5, 0.3, 0.2], 0.6)).toBe("b");
    });

    it("picks the last option when roll is near 1", () => {
        expect(weightedPick(["a", "b", "c"], [0.5, 0.3, 0.2], 0.95)).toBe("c");
    });

    it("returns first option as fallback", () => {
        expect(weightedPick(["a", "b"], [0.3, 0.3], 0.99)).toBe("a");
    });
});

describe("generateOwnerInfo", () => {
    it("returns a valid OwnerInfo object", () => {
        const property = makeProperty();
        const info = generateOwnerInfo(property);

        expect(info).toHaveProperty("name");
        expect(info).toHaveProperty("type");
        expect(info).toHaveProperty("email");
        expect(info).toHaveProperty("phone");
        expect(info).toHaveProperty("mailingAddress");
        expect(info).toHaveProperty("acquisitionDate");
        expect(info).toHaveProperty("acquisitionPrice");
        expect(info).toHaveProperty("estimatedEquity");
        expect(info).toHaveProperty("linkedProperties");
        expect(info).toHaveProperty("riskScore");
    });

    it("generates deterministic results for same property id", () => {
        const property = makeProperty({ id: "deterministic-test" });
        const info1 = generateOwnerInfo(property);
        const info2 = generateOwnerInfo(property);
        expect(info1).toEqual(info2);
    });

    it("generates different results for different property ids", () => {
        const info1 = generateOwnerInfo(makeProperty({ id: "prop-a" }));
        const info2 = generateOwnerInfo(makeProperty({ id: "prop-b" }));
        expect(info1.name).not.toBe(info2.name);
    });

    it("type is one of the valid types", () => {
        const info = generateOwnerInfo(makeProperty());
        expect(["LLC", "Individual", "Trust", "Corporation"]).toContain(info.type);
    });

    it("risk score is one of Low, Medium, High", () => {
        const info = generateOwnerInfo(makeProperty());
        expect(["Low", "Medium", "High"]).toContain(info.riskScore);
    });

    it("acquisition price is less than current price", () => {
        const property = makeProperty({ price: 1000000 });
        const info = generateOwnerInfo(property);
        expect(info.acquisitionPrice).toBeLessThan(property.price);
        expect(info.acquisitionPrice).toBeGreaterThan(0);
    });

    it("estimated equity equals price minus acquisition price", () => {
        const property = makeProperty({ price: 750000 });
        const info = generateOwnerInfo(property);
        expect(info.estimatedEquity).toBe(property.price - info.acquisitionPrice);
    });

    it("linked properties is at least 1", () => {
        const info = generateOwnerInfo(makeProperty());
        expect(info.linkedProperties).toBeGreaterThanOrEqual(1);
    });

    it("phone matches expected format", () => {
        const info = generateOwnerInfo(makeProperty());
        expect(info.phone).toMatch(/^\(305\) \d{3}-\d{4}$/);
    });

    it("acquisition date matches YYYY-MM-DD format", () => {
        const info = generateOwnerInfo(makeProperty());
        expect(info.acquisitionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("LLC owners get contact@ email domain", () => {
        // Try multiple IDs to find an LLC
        for (let i = 0; i < 20; i++) {
            const info = generateOwnerInfo(makeProperty({ id: `llc-search-${i}` }));
            if (info.type === "LLC") {
                expect(info.email).toMatch(/^contact@/);
                return;
            }
        }
    });

    it("high days_on_mls shifts risk towards High", () => {
        const highDomResults: string[] = [];
        for (let i = 0; i < 30; i++) {
            const info = generateOwnerInfo(makeProperty({ id: `risk-${i}`, days_on_mls: 120 }));
            highDomResults.push(info.riskScore);
        }
        const highCount = highDomResults.filter((r) => r === "High").length;
        expect(highCount).toBeGreaterThan(0);
    });
});
