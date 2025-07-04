// // app/(app)/_layout.tsx
// import { useAppSelector } from '@/store/hooks';
// import { Redirect, Stack } from 'expo-router';

// export default function ProtectedLayout() {
//   const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

//   if (isLoading) return null;
//   if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

//   return <Stack screenOptions={{ headerShown: true }} />;
// }

// app/(app)/_layout.tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Redirect, Stack } from 'expo-router';

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  const logout= () => {
  //   console.log("logout");
  //   dispatch(logoutUser());
  //   router.navigate('/(auth)/login');
  }
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Hello, I’m your AI Mitra 👋",
          headerShown: true,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#000',
          },
          headerStyle: {
              backgroundColor: '#87CEEB',
            },
          //   headerRight: () => (
          //   <Pressable onPress={()=>logout()}>
          //    <MaterialIcons name="logout" size={24} color="black" />
          //   </Pressable>
          // )
        }} 
      />
    </Stack>
  );
}