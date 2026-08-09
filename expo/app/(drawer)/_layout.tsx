import { Drawer } from "expo-router/drawer";
import React from "react";

import DrawerContent from "@/components/DrawerContent";
import { useTheme } from "@/providers/ThemeProvider";

export default function DrawerLayout() {
  const { colors } = useTheme();
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          backgroundColor: colors.charcoal,
          width: 308,
        },
        overlayColor: "rgba(11, 15, 20, 0.6)",
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
