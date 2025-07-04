// 📁 SessionContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type SessionType = {
  token: string | null;
  isLoading: boolean;
  signIn: (newToken: string) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionType | undefined>(undefined);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const saved = await AsyncStorage.getItem('token');
      setToken(saved);
      setLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (newToken: string) => {
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  return (
    <SessionContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};
