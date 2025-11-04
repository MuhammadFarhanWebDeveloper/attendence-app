import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * A generic hook to sync state with AsyncStorage.
 * @param key - The storage key name.
 * @param initialValue - Default value if none exists in storage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue) {
          setValue(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  // Save to AsyncStorage whenever value changes
  useEffect(() => {
    if (!loading) {
      (async () => {
        try {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error(`Error saving ${key} to storage:`, error);
        }
      })();
    }
  }, [key, value, loading]);

  // Manual update function (if you need async safety)
  const updateValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      const finalValue =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      setValue(finalValue);
      try {
        await AsyncStorage.setItem(key, JSON.stringify(finalValue));
      } catch (error) {
        console.error(`Error updating ${key}:`, error);
      }
    },
    [key, value],
  );

  // Manual remove function
  const remove = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }, [key, initialValue]);

  return { value, setValue: updateValue, remove, loading };
}
