import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import BrandHeader from "@/components/BrandHeader";
import { fonts, radii, shadows, type ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/providers/ThemeProvider";

interface Section {
  title: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    title: "1. Overview",
    body: "This Privacy Policy explains what Verex collects, why, and how it is handled. The short version: in guest mode everything stays on your device; if you sign in, your scans and collection back up to our cloud so you can restore them.",
  },
  {
    title: "2. Card photos",
    body: "Photos you capture or pick from your gallery are processed to identify the card and estimate its condition. Text is read via an OCR service (OCR.space) and a resized copy of the image is analyzed by an AI vision model. In guest mode photos are not stored on our servers. If you are signed in, scan photos are uploaded to your private cloud storage bucket.",
  },
  {
    title: "3. Approximate location (IP)",
    body: "To show prices in your local currency, Verex asks a geolocation service (ipwho.is) which country your internet connection appears to be in. Only your public IP address is used for this lookup; it is not stored by Verex and no precise GPS location is ever collected.",
  },
  {
    title: "4. Account data",
    body: "If you create an account, we store your email address and authentication tokens with Supabase. Your collection, watchlist, grading history, and expert-review submissions are linked to your account so they sync across devices.",
  },
  {
    title: "5. Card databases & prices",
    body: "Card names you scan are sent to public card databases (Pokémon TCG API, YGOPRODeck, apitcg.com, Scryfall) to find reference matches and market prices. These queries contain card text only — never your photos or personal information.",
  },
  {
    title: "6. Training labels",
    body: "If you voluntarily tag a scan as \"Confirmed Original\" or \"Confirmed Fake\" while signed in, the verdict traits (scores and signals — not your photo unless you submitted it for review) are stored to improve future detection models.",
  },
  {
    title: "7. What we do NOT do",
    body: "We do not sell your data. We do not run third-party advertising trackers. We do not collect contacts, precise location, or background data.",
  },
  {
    title: "8. Data retention & deletion",
    body: "Guest data lives only on your device and is removed when you uninstall the app. Signed-in users can request deletion of their account and all associated cloud data at any time via the contact details on the app store listing.",
  },
  {
    title: "9. Children",
    body: "Verex is not directed at children under 13. We do not knowingly collect personal information from children.",
  },
  {
    title: "10. Changes & contact",
    body: "We may update this policy as the app evolves; material changes will be announced in-app. Questions? Reach out through the app store listing contact details.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <BrandHeader showBack onBack={() => router.back()} title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: August 2026</Text>
        {SECTIONS.map((s) => (
          <View key={s.title} style={[styles.card, shadows.card]}>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
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
    gap: 12,
  },
  updated: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.inkFaint,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 6,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkSoft,
  },
});
