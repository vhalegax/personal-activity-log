import { getStoredValue, updateStoredValue, type StorageData } from '@/lib/storage';
import { useEffect, useState } from 'react';

/**
 * Custom hook untuk localStorage dengan fallback
 * Saat mount, load dari localStorage dulu
 * Saat update, otomatis save ke localStorage
 */
export function useLocalStorage<K extends keyof StorageData>(
  key: K,
  initialValue: StorageData[K],
): [StorageData[K], (value: StorageData[K]) => void] {
  const [value, setValue] = useState<StorageData[K]>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredValue(key);
    if (stored !== null) {
      setValue(stored);
    }
    setIsMounted(true);
  }, [key]);

  // Save to localStorage when value changes (after mount)
  const setValueWithStorage = (newValue: StorageData[K]) => {
    setValue(newValue);
    if (isMounted) {
      updateStoredValue(key, newValue);
    }
  };

  return [value, setValueWithStorage];
}
