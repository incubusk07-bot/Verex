import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_900Black,
} from "@expo-google-fonts/fraunces";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import AuthSheet from "@/components/AuthSheet";
import { lightColors } from "@/constants/theme";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: "fade" }} />
        <Stack.Screen name="scan-result" options={{ gestureEnabled: false }} />
        <Stack.Screen name="card/[id]" />
        <Stack.Screen name="review-queue" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
      </Stack>
      <AuthSheet />
    </>
  );
}

function HydrationGate() {
  const { hydrated } = useApp();
  const { themeHydrated } = useTheme();
  const ready = hydrated && themeHydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return (
      <View style={loadingStyles.wrap}>
        <Image
          source={require("@/assets/images/brand/wordmark.png")}
          style={loadingStyles.wordmark}
          contentFit="contain"
        />
      </View>
    );
  }
  return <RootLayoutNav />;
}

const loadingStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: lightColors.charcoal,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    width: 180,
    height: 30,
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_900Black,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <HydrationGate />
          </GestureHandlerRootView>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
