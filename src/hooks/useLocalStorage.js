import { useState, useEffect, useCallback } from "react";

function resolveInitial(initialValue) {
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : resolveInitial(initialValue);
    } catch {
      return resolveInitial(initialValue);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Storage full or unavailable
    }
  }, [key, storedValue]);

  const reset = useCallback(() => {
    const freshValue = resolveInitial(initialValue);
    setStoredValue(freshValue);
    try {
      window.localStorage.setItem(key, JSON.stringify(freshValue));
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue, reset];
}
