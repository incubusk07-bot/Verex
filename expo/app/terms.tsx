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
    title: "1. Acceptance of terms",
    body: "By downloading or using Verex you agree to these Terms & Conditions. If you do not agree, do not use the app. Verex may update these terms from time to time; continued use after changes means you accept the updated terms.",
  },
  {
    title: "2. What Verex is — and is not",
    body: "Verex provides automated Pre-Grade Estimates and authenticity signals for trading cards using computer vision and public card databases. Results are estimates only and are NOT official certification, grading, or authentication. Verex is not affiliated with PSA, Beckett, CGC, Pokémon, Konami, Bandai, Wizards of the Coast, Panini, or any grading company or card publisher.",
  },
  {
    title: "3. No financial or purchase advice",
    body: "Market prices shown in the app come from third-party sources and currency rates are approximate. Nothing in Verex constitutes financial, investment, or purchase advice. Always verify high-value cards with a professional grading service before buying or selling.",
  },
  {
    title: "4. Accuracy limitations",
    body: "Analysis accuracy depends on photo quality, lighting, and card condition. High-quality counterfeits and proxies (especially Magic: The Gathering) may not be detected by camera-based analysis. You accept that verdicts can be wrong and agree not to hold Verex liable for decisions made based on them.",
  },
  {
    title: "5. Your account and data",
    body: "You can use Verex as a guest — data stays on your device. If you create an account, your collection, scans, and review submissions sync to our cloud (Supabase). You are responsible for keeping your login credentials safe.",
  },
  {
    title: "6. Acceptable use",
    body: "You agree not to misuse the app, attempt to reverse-engineer it, use it to deceive buyers or sellers, or upload unlawful content. Card names, images, and trademarks belong to their respective owners and are used for identification only.",
  },
  {
    title: "7. Expert review credits",
    body: "Expert review credits are consumed only when you explicitly submit a card for review. Credits have no cash value and are non-transferable.",
  },
  {
    title: "8. Limitation of liability",
    body: "Verex is provided \"as is\" without warranties of any kind. To the maximum extent permitted by law, Verex and its creators are not liable for any direct, indirect, incidental, or consequential damages arising from use of the app, including losses from card purchases or sales.",
  },
  {
    title: "9. Contact",
    body: "Questions about these terms? Reach out through the app store listing contact details.",
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <BrandHeader showBack onBack={() => router.back()} title="Terms & Conditions" />
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
