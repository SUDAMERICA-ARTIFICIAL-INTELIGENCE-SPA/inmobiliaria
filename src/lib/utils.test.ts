import { describe, it, expect } from "vitest";
import { cn, formatPrice, calculateBaths, isSafeUrl } from "./utils";

describe("cn", () => {
    it("merges class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("merges tailwind conflicts correctly", () => {
        expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("handles empty inputs", () => {
        expect(cn()).toBe("");
    });

    it("handles undefined and null", () => {
        expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });
});

describe("formatPrice", () => {
    it("formats a round number", () => {
        expect(formatPrice(750000)).toBe("US$ 750,000");
    });

    it("formats zero", () => {
        expect(formatPrice(0)).toBe("US$ 0");
    });

    it("truncates decimals", () => {
        expect(formatPrice(123456.78)).toBe("US$ 123,457");
    });

    it("formats millions", () => {
        expect(formatPrice(2500000)).toBe("US$ 2,500,000");
    });
});

describe("calculateBaths", () => {
    it("returns full baths when no half baths", () => {
        expect(calculateBaths(3, 0)).toBe(3);
    });

    it("adds half baths as 0.5 each", () => {
        expect(calculateBaths(2, 1)).toBe(2.5);
    });

    it("handles multiple half baths", () => {
        expect(calculateBaths(1, 2)).toBe(2);
    });

    it("returns 0 when both are 0", () => {
        expect(calculateBaths(0, 0)).toBe(0);
    });

    it("handles only half baths", () => {
        expect(calculateBaths(0, 3)).toBe(1.5);
    });
});

describe("isSafeUrl", () => {
    it("accepts https urls", () => {
        expect(isSafeUrl("https://example.com")).toBe(true);
    });

    it("accepts http urls", () => {
        expect(isSafeUrl("http://example.com")).toBe(true);
    });

    it("rejects javascript protocol", () => {
        expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    });

    it("rejects data protocol", () => {
        expect(isSafeUrl("data:text/html,<h1>hi</h1>")).toBe(false);
    });

    it("rejects invalid urls", () => {
        expect(isSafeUrl("not-a-url")).toBe(false);
    });

    it("rejects empty string", () => {
        expect(isSafeUrl("")).toBe(false);
    });
});
