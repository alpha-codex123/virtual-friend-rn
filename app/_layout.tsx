// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useStorageState } from '@/hooks/useStorageState';

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   // const [state, setState] = useStorageState();
//     const [[isLoading, token], setToken] = useStorageState('token');
//     console.log('token===', token)

//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   if (!loaded) {
//     // Async font loading only occurs in development.
//     return null;
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         {/* <Stack.Screen name="(tab)" options={{ headerShown: false }} /> */}
//         {token ? <Stack.Screen name="(app)" options={{ headerShown: false }} /> : <Stack.Screen name="(auth)" options={{ headerShown: false }} />}
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }



// app/_layout.tsx
import { persistor, store } from '@/store';
import { ReduxProvider } from '@/store/Provider';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
      <ReduxProvider>
        <Slot />
      </ReduxProvider>
    </PersistGate>
    </Provider>
  );
}
