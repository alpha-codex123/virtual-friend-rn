import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useAppDispatch } from './hooks';
import { store } from './index';
import { persistToken } from './slices/authSlice';

interface ReduxProviderProps {
  children: React.ReactNode;
}

// Component to initialize auth state
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for persisted token on app start
    dispatch(persistToken());
  }, [dispatch]);

  return <>{children}</>;
};

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
}; 