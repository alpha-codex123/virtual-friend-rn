// app/(auth)/_layout.tsx
import { useAppSelector } from '@/store/hooks';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/(app)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
