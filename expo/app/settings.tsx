import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  ChevronRight,
  Download,
  FileText,
  Globe,
  HelpCircle,
  LogOut,
  Moon,
  ShieldCheck,
  Vibrate,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import BrandHeader from "@/components/BrandHeader";
import DisclaimerNote from "@/components/DisclaimerNote";
import GoldButton from "@/components/GoldButton";
import { DETECTION_PROFILES, STRICTNESS_META } from "@/constants/config";
import { fonts, radii, shadows, type ThemeColors } from "@/constants/theme";
import { useApp } from "@/providers/AppProvider";
import { useTheme, useThemedStyles } from "@/providers/ThemeProvider";
import type { ScanAnalysis } from "@/types/card";
import { tapHaptic } from "@/utils/haptics";

const csvEscape = (value: string): string => `"${value.replace(/"/g, '""')}"`;

/** Builds a spreadsheet-ready CSV of the full scan history. */
function buildCsv(scans: ScanAnalysis[]): string {
  const header = [
    "Date",
    "Card",
    "Set",
    "Game",
    "Verdict",
    "Match %",
    "Condition (1-10)",
    "Market price (USD)",
    "Saved to collection",
  ].join(",");
  const rows = scans.map((s) =>
    [
      csvEscape(new Date(s.createdAt).toISOString()),
      csvEscape(s.card?.name ?? s.nameGuess ?? "Unknown"),
      csvEscape(s.card?.setName ?? ""),
      csvEscape(s.card?.game ?? ""),
      csvEscape(s.verdict),
      String(s.matchConfidence),
      s.conditionScore.toFixed(1),
      s.card?.marketPrice != null ? s.card.marketPrice.toFixed(2) : "",
      s.savedToCollection ? "yes" : "no",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleScheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    session,
    setAuthSheetVisible,
    signOutUser,
    autoCapture,
    setAutoCapture,
    hapticsEnabled,
    setHapticsEnabled,
    currency,
    resetCaptureHint,
    detectionStrictness,
    setDetectionStrictness,
    scans,
  } = useApp();

  const [exporting, setExporting] = useState<boolean>(false);

  const profile = DETECTION_PROFILES[detectionStrictness];
  const activeMeta = STRICTNESS_META.find((m) => m.id === detectionStrictness) ?? STRICTNESS_META[1];

  const showGuideAgain = () => {
    void tapHaptic("select");
    resetCaptureHint();
    router.push("/(drawer)/(tabs)/scan" as never);
  };

  const exportHistory = async () => {
    if (scans.length === 0 || exporting) return;
    setExporting(true);
    void tapHaptic("select");
    try {
      const csv = buildCsv(scans);
      const filename = `verex-scan-history-${new Date().toISOString().slice(0, 10)}.csv`;
      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      } else {
        const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        if (!dir) throw new Error("No writable directory available");
        const fileUri = `${dir}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export scan history",
          });
        } else {
          Alert.alert("Export ready", `CSV saved to:\n${fileUri}`);
        }
      }
      void tapHaptic("success");
    } catch (e) {
      console.log("[settings] export failed", e);
      Alert.alert("Export failed", "Could not create the CSV file. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <BrandHeader showBack onBack={() => router.back()} title="Settings" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPEARANCE</Text>
          <View style={[styles.card, shadows.card]}>
            <View style={styles.row}>
              <View style={styles.rowIconBox}>
                <Moon size={17} color={colors.goldDeep} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Dark mode</Text>
                <Text style={styles.rowSub}>Vault-at-night theme across the whole app</Text>
              </View>
              <Switch
                testID="settings-dark-mode"
                value={isDark}
                onValueChange={() => {
                  void tapHaptic("select");
                  toggleScheme();
                }}
                trackColor={{ false: colors.hairlineStrong, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SCANNING</Text>
          <View style={[styles.card, shadows.card]}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Auto-capture</Text>
                <Text style={styles.rowSub}>Shoot automatically once the card is framed</Text>
              </View>
              <Switch
                testID="settings-auto"
                value={autoCapture}
                onValueChange={setAutoCapture}
                trackColor={{ false: colors.hairlineStrong, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.rowIconBox}>
                <Vibrate size={17} color={colors.goldDeep} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Haptic feedback</Text>
                <Text style={styles.rowSub}>Subtle taps on capture and verdicts</Text>
              </View>
              <Switch
                testID="settings-haptics"
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: colors.hairlineStrong, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.divider} />
            <Pressable
              testID="settings-capture-guide"
              onPress={showGuideAgain}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.rowIconBox}>
                <HelpCircle size={17} color={colors.goldDeep} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Show capture guide</Text>
                <Text style={styles.rowSub}>Replay the how-to-photograph tips on the scanner</Text>
              </View>
              <ChevronRight size={18} color={colors.inkFaint} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DETECTION STRICTNESS</Text>
          <View style={[styles.card, shadows.card, styles.strictnessCard]}>
            <View style={styles.strictnessRow}>
              {STRICTNESS_META.map((opt) => {
                const active = detectionStrictness === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    testID={`settings-strictness-${opt.id}`}
                    onPress={() => {
                      void tapHaptic("select");
                      setDetectionStrictness(opt.id);
                    }}
                    style={[styles.strictnessChip, active ? styles.strictnessChipActive : null]}
                  >
                    <Text
                      style={[styles.strictnessLabel, active ? styles.strictnessLabelActive : null]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.strictnessSub}>{activeMeta.sub}</Text>
            <Text style={styles.strictnessDetail}>
              Match bar {profile.matchThreshold}% · text match ≥
              {Math.round(profile.textSimPass * 100)}% · print sharpness ≥{profile.sharpnessMin}/10
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <View style={[styles.card, shadows.card]}>
            <Pressable
              testID="settings-export"
              onPress={() => void exportHistory()}
              disabled={scans.length === 0 || exporting}
              style={({ pressed }) => [
                styles.row,
                { opacity: scans.length === 0 ? 0.45 : pressed || exporting ? 0.7 : 1 },
              ]}
            >
              <View style={styles.rowIconBox}>
                <Download size={17} color={colors.goldDeep} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>
                  {exporting ? "Preparing export…" : "Export scan history"}
                </Text>
                <Text style={styles.rowSub}>
                  {scans.length === 0
                    ? "Scan a card first — there's nothing to export yet"
                    : `${scans.length} scan${scans.length === 1 ? "" : "s"} → CSV via the share sheet`}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.inkFaint} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REGION & CURRENCY</Text>
          <View style={[styles.card, shadows.card]}>
            <View style={styles.row}>
              <View style={styles.rowIconBox}>
                <Globe size={17} color={colors.goldDeep} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>
                  {currency.code}
                  {currency.countryName ? ` · ${currency.countryName}` : ""}
                </Text>
                <Text style={styles.rowSub}>
                  {currency.code === "USD" && !currency.countryName
                    ? "Detected automatically from your connection — prices show in USD."
                    : `Detected automatically from your connection — market prices are converted from USD at ${currency.rate.toFixed(currency.rate >= 10 ? 2 : 4)} ${currency.code}/USD.`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={[styles.card, shadows.card]}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{session?.user?.email ?? "Guest mode"}</Text>
                <Text style={styles.rowSub}>
                  {session
                    ? "Collection and gradings back up to your account."
                    : "Everything stays on this device until you sign in."}
                </Text>
              </View>
            </View>
            <View style={styles.buttonPad}>
              {session ? (
                <GoldButton
                  testID="settings-signout"
                  label="Sign Out"
                  variant="ghost"
                  small
                  icon={<LogOut size={15} color={colors.ink} />}
                  onPress={() => void signOutUser()}
                />
              ) : (
                <GoldButton
                  testID="settings-signin"
                  label="Sign In / Create Account"
                  small
                  onPress={() => setAuthSheetVisible(true)}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <View style={[styles.card, shadows.card]}>
            <Pressable
              testID="settings-terms"
              onPress={() => {
                void tapHaptic("select");
                router.push("/terms" as never);
              }}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.rowIconBox}>
                <FileText size={17} color={colors.goldDeep} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Terms & Conditions</Text>
                <Text style={styles.rowSub}>The rules of using Verex</Text>
              </View>
              <ChevronRight size={18} color={colors.inkFaint} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              testID="settings-privacy"
              onPress={() => {
                void tapHaptic("select");
                router.push("/privacy" as never);
              }}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.rowIconBox}>
                <ShieldCheck size={17} color={colors.goldDeep} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
                <Text style={styles.rowSub}>How your photos and data are handled</Text>
              </View>
              <ChevronRight size={18} color={colors.inkFaint} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISCLAIMERS</Text>
          <DisclaimerNote variant="full" />
        </View>

        <View style={styles.footer}>
          <ShieldCheck size={12} color={colors.inkFaint} />
          <Text style={styles.footerText}>Verex v1.0.0 · Not affiliated with PSA, Beckett or CGC</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.inkFaint,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.goldFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: colors.ink,
  },
  rowSub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginLeft: 16,
  },
  strictnessCard: {
    padding: 14,
    gap: 10,
  },
  strictnessRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.pill,
    padding: 4,
    gap: 4,
  },
  strictnessChip: {
    flex: 1,
    height: 38,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  strictnessChipActive: {
    backgroundColor: colors.gold,
  },
  strictnessLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  strictnessLabelActive: {
    color: colors.charcoal,
  },
  strictnessSub: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.ink,
    paddingHorizontal: 2,
  },
  strictnessDetail: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.inkSoft,
    paddingHorizontal: 2,
  },
  buttonPad: {
    padding: 14,
    paddingTop: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.inkFaint,
  },
});
