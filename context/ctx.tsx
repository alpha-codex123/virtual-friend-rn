import { useStorageState } from '@/hooks/useStorageState';
import React, { createContext } from 'react';

export interface AuthContextType {
  session: string | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useSession() { /* ... */ }
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [[isLoading, session], setSession] = useStorageState('session');

  const value: AuthContextType = {
    session,
    isLoading,
    signIn: () => setSession('dummy-token'),
    signOut: () => setSession(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

