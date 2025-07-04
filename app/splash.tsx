import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { persistToken } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    // Check for persisted token on app start
    dispatch(persistToken());
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSplashComplete(true);
    }, 2000); // 2 seconds splash

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Only navigate after splash is complete and auth state is determined
    if (splashComplete && !isLoading) {
      // Navigate based on authentication state
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [splashComplete, isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Ai Mitra </Text>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});