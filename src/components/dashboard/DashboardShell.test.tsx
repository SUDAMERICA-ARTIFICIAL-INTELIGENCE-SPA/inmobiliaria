import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
    SkeletonCards,
    StatsBarSkeleton,
    MapLoadingPlaceholder,
    ErrorState,
    DashboardHeader,
} from "./DashboardShell";

describe("SkeletonCards", () => {
    it("renders the specified number of skeleton cards", () => {
        const { container } = render(<SkeletonCards count={3} height="h-24" />);
        const cards = container.querySelectorAll(".animate-pulse");
        expect(cards).toHaveLength(3);
    });

    it("applies the height class to each card", () => {
        const { container } = render(<SkeletonCards count={2} height="h-48" />);
        const cards = container.querySelectorAll(".h-48");
        expect(cards).toHaveLength(2);
    });

    it("renders zero cards when count is 0", () => {
        const { container } = render(<SkeletonCards count={0} height="h-24" />);
        const cards = container.querySelectorAll(".animate-pulse");
        expect(cards).toHaveLength(0);
    });
});

describe("StatsBarSkeleton", () => {
    it("renders a grid with 4 skeleton cards", () => {
        const { container } = render(<StatsBarSkeleton />);
        const cards = container.querySelectorAll(".animate-pulse");
        expect(cards).toHaveLength(4);
    });

    it("renders the grid container", () => {
        const { container } = render(<StatsBarSkeleton />);
        expect(container.querySelector(".grid")).toBeInTheDocument();
    });
});

describe("MapLoadingPlaceholder", () => {
    it("renders loading spinner", () => {
        const { container } = render(<MapLoadingPlaceholder />);
        expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders loading text", () => {
        render(<MapLoadingPlaceholder />);
        expect(screen.getByText("Inicializando enlace satelital...")).toBeInTheDocument();
    });
});

describe("ErrorState", () => {
    it("renders the error message", () => {
        render(<ErrorState error="Connection failed" onRetry={vi.fn()} />);
        expect(screen.getByText("Error del Sistema: Connection failed")).toBeInTheDocument();
    });

    it("renders retry button", () => {
        render(<ErrorState error="Timeout" onRetry={vi.fn()} />);
        expect(screen.getByText("Reintentar Conexión")).toBeInTheDocument();
    });

    it("calls onRetry when button is clicked", () => {
        const onRetry = vi.fn();
        render(<ErrorState error="Timeout" onRetry={onRetry} />);
        fireEvent.click(screen.getByText("Reintentar Conexión"));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});

describe("DashboardHeader", () => {
    it("renders the title", () => {
        render(<DashboardHeader onReload={vi.fn()} />);
        expect(screen.getByText("PREDESARROLLO")).toBeInTheDocument();
        expect(screen.getByText("AGENTE DE IA")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
        render(<DashboardHeader onReload={vi.fn()} />);
        expect(screen.getByText("Proyecto para Carlos Pulido")).toBeInTheDocument();
    });

    it("renders version badge", () => {
        render(<DashboardHeader onReload={vi.fn()} />);
        expect(screen.getByText("v0.9.5 (Live Data)")).toBeInTheDocument();
    });

    it("renders sync button", () => {
        render(<DashboardHeader onReload={vi.fn()} />);
        expect(screen.getByText("Sincronizar")).toBeInTheDocument();
    });

    it("calls onReload when sync button is clicked", () => {
        const onReload = vi.fn();
        render(<DashboardHeader onReload={onReload} />);
        fireEvent.click(screen.getByText("Sincronizar"));
        expect(onReload).toHaveBeenCalledTimes(1);
    });

    it("renders live feed indicator", () => {
        render(<DashboardHeader onReload={vi.fn()} />);
        expect(screen.getByText("Feed en Vivo")).toBeInTheDocument();
    });
});
