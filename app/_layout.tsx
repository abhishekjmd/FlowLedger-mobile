import "react-native-reanimated";
import { useEffect } from "react";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "../global.css";
import { useAuthStore } from "@/store/auth.store";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, hasSessionToken, isLoading, initialize } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    const shouldBeInApp = isAuthenticated || hasSessionToken;

    if (!shouldBeInApp && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (shouldBeInApp && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, hasSessionToken, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DarkTheme}>
          <RootLayoutNav />
          <StatusBar style="light" />
          <Toast />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
