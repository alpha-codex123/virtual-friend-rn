// app/useStorageState.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useStorageState(key: string): [[boolean, string | null], (value: string | null) => void] {
  const [state, setState] = useState<[boolean, string | null]>([true, null]);

  useEffect(() => {
    const getStoredValue = async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        setState([false, value]);
      } catch (e) {
        setState([false, null]);
      }
    };
    getStoredValue();
  }, [key]);

  const setValue = async (value: string | null) => {
    try {
      if (value === null) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.setItem(key, value);
      }
      setState([false, value]);
    } catch (e) {
      console.error('AsyncStorage error:', e);
    }
  };

  return [state, setValue];
}
