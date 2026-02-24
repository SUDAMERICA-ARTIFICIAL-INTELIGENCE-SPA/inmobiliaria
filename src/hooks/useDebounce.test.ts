import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounceValue, useDebouncedCallback } from "./useDebounce";

describe("useDebounceValue", () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it("should return initial value immediately", () => {
        const { result } = renderHook(() => useDebounceValue("hello", 300));
        expect(result.current).toBe("hello");
    });

    it("should not update value before delay expires", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounceValue(value, 300),
            { initialProps: { value: "initial" } }
        );

        rerender({ value: "updated" });
        act(() => { vi.advanceTimersByTime(200); });
        expect(result.current).toBe("initial");
    });

    it("should update value after delay expires", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounceValue(value, 300),
            { initialProps: { value: "initial" } }
        );

        rerender({ value: "updated" });
        act(() => { vi.advanceTimersByTime(300); });
        expect(result.current).toBe("updated");
    });

    it("should reset timer on rapid changes and only use last value", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounceValue(value, 300),
            { initialProps: { value: "a" } }
        );

        rerender({ value: "b" });
        act(() => { vi.advanceTimersByTime(100); });
        rerender({ value: "c" });
        act(() => { vi.advanceTimersByTime(100); });
        rerender({ value: "d" });
        act(() => { vi.advanceTimersByTime(300); });

        expect(result.current).toBe("d");
    });

    it("should work with numeric values", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounceValue(value, 100),
            { initialProps: { value: 0 } }
        );

        rerender({ value: 42 });
        act(() => { vi.advanceTimersByTime(100); });
        expect(result.current).toBe(42);
    });

    it("should work with null values", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounceValue(value, 100),
            { initialProps: { value: "hello" as string | null } }
        );

        rerender({ value: null });
        act(() => { vi.advanceTimersByTime(100); });
        expect(result.current).toBeNull();
    });
});

describe("useDebouncedCallback", () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it("should not call callback before delay", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 200));

        act(() => { result.current("arg1"); });
        expect(callback).not.toHaveBeenCalled();
    });

    it("should call callback after delay", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 200));

        act(() => { result.current("arg1"); });
        act(() => { vi.advanceTimersByTime(200); });
        expect(callback).toHaveBeenCalledWith("arg1");
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should only call with last args on rapid calls", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 200));

        act(() => {
            result.current("first");
            result.current("second");
            result.current("third");
        });
        act(() => { vi.advanceTimersByTime(200); });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("third");
    });

    it("should return a stable function reference", () => {
        const callback = vi.fn();
        const { result, rerender } = renderHook(() => useDebouncedCallback(callback, 200));

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;
        expect(ref1).toBe(ref2);
    });

    it("should use the latest callback on re-render", () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        const { result, rerender } = renderHook(
            ({ cb }) => useDebouncedCallback(cb, 200),
            { initialProps: { cb: callback1 } }
        );

        rerender({ cb: callback2 });
        act(() => { result.current("test"); });
        act(() => { vi.advanceTimersByTime(200); });

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledWith("test");
    });

    it("should clean up timer on unmount", () => {
        const callback = vi.fn();
        const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 200));

        act(() => { result.current("arg"); });
        unmount();
        act(() => { vi.advanceTimersByTime(200); });

        expect(callback).not.toHaveBeenCalled();
    });

    it("should handle multiple argument types", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 100));

        act(() => { result.current("str", 42); });
        act(() => { vi.advanceTimersByTime(100); });

        expect(callback).toHaveBeenCalledWith("str", 42);
    });
});
