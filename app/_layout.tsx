// // app/_layout.tsx
// import { ReduxProvider } from '@/store/Provider';
// import { Slot } from 'expo-router';
// export default function RootLayout() {
//   return (
//     // <Provider store={store}>
//     //   <PersistGate persistor={persistor}>
//       <ReduxProvider>
//         <Slot />
//       </ReduxProvider>
//     // </PersistGate>
//     // </Provider>
//   );
// }
import { ReduxProvider } from '@/store/Provider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Simulate splash screen delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!loaded || isLoading) {
    // Show splash screen while fonts are loading or during initial delay
    return null; // This will show the splash screen
  }

  return (
    <ReduxProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack 
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
            },
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
            headerTitleStyle: {
              fontFamily: 'SpaceMono',
              fontSize: 20,
            },
            headerShown: false
          }}
        >
          {/* Show splash screen first */}
          <Stack.Screen 
            name="splash" 
            options={{ headerShown: false }} 
          />
          
          {/* Auth screens */}
          <Stack.Screen 
            name="login" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="registration" 
            options={{ headerShown: false }} 
          />
          
          {/* App screens - only accessible when authenticated */}
          <Stack.Screen 
            name="home" 
            options={{ headerShown: false }} 
          />
          
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ReduxProvider>
  );
}

