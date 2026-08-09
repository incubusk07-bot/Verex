import { CheckCircle2, MinusCircle, XCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { fonts, type ThemeColors } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/providers/ThemeProvider";
import type { AuthenticitySignal } from "@/types/card";

interface SignalRowProps {
  signal: AuthenticitySignal;
}

export default function SignalRow({ signal }: SignalRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const icon =
    signal.passed === true ? (
      <CheckCircle2 size={18} color={colors.success} />
    ) : signal.passed === false ? (
      <XCircle size={18} color={colors.error} />
    ) : (
      <MinusCircle size={18} color={colors.inkFaint} />
    );

  return (
    <View style={styles.row}>
      <View style={styles.icon}>{icon}</View>
      <View style={styles.textCol}>
        <Text style={styles.label}>{signal.label}</Text>
        {signal.detail ? <Text style={styles.detail}>{signal.detail}</Text> : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
  },
  icon: {
    marginTop: 1,
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.ink,
  },
  detail: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
});
