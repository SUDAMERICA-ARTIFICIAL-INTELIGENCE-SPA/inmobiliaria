import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsBar } from "./StatsBar";
import { DashboardStats } from "@/lib/types";

vi.mock("framer-motion");

const mockStats: DashboardStats = {
    totalProperties: 150,
    avgPrice: 450000,
    medianPrice: 400000,
    opportunities: 23,
    avgDaysOnMarket: 45,
    totalValue: 67500000,
};

describe("StatsBar", () => {
    it("renders null when stats is null", () => {
        const { container } = render(<StatsBar stats={null} />);
        expect(container.innerHTML).toBe("");
    });

    it("renders total properties", () => {
        render(<StatsBar stats={mockStats} />);
        expect(screen.getByText("150")).toBeInTheDocument();
    });

    it("renders average price formatted", () => {
        render(<StatsBar stats={mockStats} />);
        expect(screen.getByText("US$ 450,000")).toBeInTheDocument();
    });

    it("renders opportunities count", () => {
        render(<StatsBar stats={mockStats} />);
        expect(screen.getByText("23")).toBeInTheDocument();
    });

    it("renders average days on market", () => {
        render(<StatsBar stats={mockStats} />);
        expect(screen.getByText("45")).toBeInTheDocument();
    });

    it("renders all four stat labels", () => {
        render(<StatsBar stats={mockStats} />);
        expect(screen.getByText("Propiedades Encontradas")).toBeInTheDocument();
        expect(screen.getByText("Precio Promedio")).toBeInTheDocument();
        expect(screen.getByText("Oportunidades")).toBeInTheDocument();
        expect(screen.getByText("Días Promedio en Mercado")).toBeInTheDocument();
    });
});
