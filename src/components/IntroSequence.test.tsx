import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { IntroSequence } from "./IntroSequence";

vi.mock("framer-motion");

describe("IntroSequence", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders system title", () => {
        render(<IntroSequence onComplete={vi.fn()} />);
        expect(screen.getByText("Sistema de Inteligencia Inmobiliaria")).toBeInTheDocument();
    });

    it("renders progress indicator starting at 0%", () => {
        render(<IntroSequence onComplete={vi.fn()} />);
        expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("renders version text", () => {
        render(<IntroSequence onComplete={vi.fn()} />);
        expect(screen.getByText(/v0\.9\.5/)).toBeInTheDocument();
    });

    it("shows terminal lines progressively", () => {
        render(<IntroSequence onComplete={vi.fn()} />);

        act(() => { vi.advanceTimersByTime(100); });
        expect(screen.getByText(/Inicializando sistema OSINT/)).toBeInTheDocument();

        act(() => { vi.advanceTimersByTime(700); });
        expect(screen.getByText(/Conectando a servidores/)).toBeInTheDocument();
    });

    it("calls onComplete after full sequence", () => {
        const onComplete = vi.fn();
        render(<IntroSequence onComplete={onComplete} />);

        act(() => { vi.advanceTimersByTime(6000); });
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("shows access granted message", () => {
        render(<IntroSequence onComplete={vi.fn()} />);

        act(() => { vi.advanceTimersByTime(4100); });
        expect(screen.getByText("█ ACCESO CONCEDIDO █")).toBeInTheDocument();
    });

    it("cleans up all timers on unmount (no setTimeout leak)", () => {
        const onComplete = vi.fn();
        const { unmount } = render(<IntroSequence onComplete={onComplete} />);

        // Advance partially so some timers are pending
        act(() => { vi.advanceTimersByTime(1000); });

        // Unmount to trigger cleanup
        unmount();

        // Advance past all scheduled timeouts — onComplete should NOT fire
        act(() => { vi.advanceTimersByTime(10000); });
        expect(onComplete).not.toHaveBeenCalled();
    });
});
