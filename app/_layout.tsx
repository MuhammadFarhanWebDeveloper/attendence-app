import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "./globals.css";
import { StatusBar } from "react-native";
import { UserProvider } from "@/context/AuthContext";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return <RootLayoutNav />;
}
function RootLayoutNav() {
  return (
    <UserProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <Stack.Screen name="(principal)" options={{ headerShown: false }} />
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}
