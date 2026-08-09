import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

import { darkColors, lightColors, type ThemeColors } from "@/constants/theme";

export type ThemeScheme = "light" | "dark";

const THEME_KEY = "verex.theme.v1";

/**
 * App-wide theme state. Persists the chosen scheme and exposes the active
 * palette. Light is the default and matches the original imported design 1:1.
 */
export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [scheme, setScheme] = useState<ThemeScheme>("light");
  const [themeHydrated, setThemeHydrated] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((value) => {
        if (value === "dark") setScheme("dark");
      })
      .catch((e) => console.log("[theme] hydrate failed", e))
      .finally(() => setThemeHydrated(true));
  }, []);

  const applyScheme = useCallback((next: ThemeScheme) => {
    setScheme(next);
    AsyncStorage.setItem(THEME_KEY, next).catch((e) =>
      console.log("[theme] persist failed", e),
    );
  }, []);

  const toggleScheme = useCallback(() => {
    setScheme((prev) => {
      const next: ThemeScheme = prev === "light" ? "dark" : "light";
      AsyncStorage.setItem(THEME_KEY, next).catch((e) =>
        console.log("[theme] persist failed", e),
      );
      return next;
    });
  }, []);

  const colors: ThemeColors = scheme === "dark" ? darkColors : lightColors;
  const isDark = scheme === "dark";

  return useMemo(
    () => ({ scheme, colors, isDark, setScheme: applyScheme, toggleScheme, themeHydrated }),
    [scheme, colors, isDark, applyScheme, toggleScheme, themeHydrated],
  );
});

/**
 * Builds a themed StyleSheet from a module-level factory.
 * Re-computes only when the palette flips (factory identity is stable).
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
