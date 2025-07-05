import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { persistToken } from "@/store/slices/authSlice";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

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
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }
  }, [splashComplete, isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/AI_Mitra.png")}
        style={styles.image}
        resizeMode="contain"
      />
      {/* <Text style={styles.title}>Welcome to Ai Mitra </Text> */}
      <Text style={[styles.title, styles.subtitle]}>
        Always here to listen. Always by your side
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "gray",
  },
  image: {
    width: 256,
    height: 256,
    marginBottom: 10,
  },
});
