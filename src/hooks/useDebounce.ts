import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Returns a debounced version of the provided value.
 * Updates only after the specified delay of inactivity.
 */
export function useDebounceValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}

/**
 * Returns a stable debounced callback that delays invocation
 * until after `delayMs` milliseconds of inactivity.
 * The returned function is referentially stable across renders.
 */
export function useDebouncedCallback<Args extends unknown[]>(
    callback: (...args: Args) => void,
    delayMs: number,
): (...args: Args) => void {
    const callbackRef = useRef(callback);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return useCallback((...args: Args) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    }, [delayMs]);
}
