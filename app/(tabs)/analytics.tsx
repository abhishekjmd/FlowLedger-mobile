import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, StatusBar, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { Colors } from "@/constants/theme";
import { formatINR, formatINRCompact } from "@/utils/currency";

const { width } = Dimensions.get("window");
const CHART_W = width - 48;

const RANGES = ["1M", "3M", "6M", "1Y"] as const;
type Range = typeof RANGES[number];

const PIE_COLORS = [Colors.primary, Colors.accent, Colors.warning, Colors.danger, "#8B5CF6", "#EC4899"];

export default function AnalyticsScreen() {
  const { summary, breakdown, trends, insights, isLoading, refetch } = useAnalytics();
  const [range, setRange] = useState<Range>("6M");

  const totalSpend = breakdown.reduce((s: number, b: any) => s + b.amount, 0);
  const maxTrend = Math.max(...(trends.map((t: any) => t.amount) ?? [1]), 1);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageLabel}>Analytics</Text>
            <Text style={styles.pageTitle}>Your Spending Story</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={22} color={Colors.primary} />
          </View>
        </View>

        {/* Summary KPI Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>This Month</Text>
            <Text style={styles.kpiValue}>{formatINR(summary?.currentMonth ?? 0, 0)}</Text>
            <Text style={[styles.kpiChange, { color: (summary?.difference ?? 0) > 0 ? Colors.danger : Colors.accent }]}>
              {(summary?.difference ?? 0) > 0 ? "↑" : "↓"} vs last month
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Last Month</Text>
            <Text style={styles.kpiValue}>{formatINR(summary?.lastMonth ?? 0, 0)}</Text>
            <Text style={styles.kpiChange}>Baseline</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary + "30" }]}>
            <Text style={styles.kpiLabel}>Daily Avg</Text>
            <Text style={[styles.kpiValue, { color: Colors.primaryLight }]}>
              {formatINR((summary?.currentMonth ?? 0) / 30, 0)}
            </Text>
            <Text style={[styles.kpiChange, { color: Colors.primary }]}>per day</Text>
          </View>
        </View>

        {/* Bar Chart — Monthly Trends */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>Monthly Spending</Text>
              <Text style={styles.cardTitle}>6-Month Trend</Text>
            </View>
            {/* Range selector */}
            <View style={styles.rangeRow}>
              {RANGES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
                >
                  <Text style={[styles.rangeTxt, range === r && styles.rangeTxtActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Custom bar chart */}
          <View style={styles.barChart}>
            {trends.slice(-6).map((t: any, i: number) => {
              const h = maxTrend > 0 ? ((t.amount / maxTrend) * 100) : 0;
              const isLast = i === trends.slice(-6).length - 1;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barAmt}>{formatINRCompact(t.amount)}</Text>
                  <View style={styles.barWrap}>
                    <View style={[styles.barFill, { height: `${Math.max(h, 4)}%`, backgroundColor: isLast ? Colors.primary : Colors.surfaceBorder }]} />
                  </View>
                  <Text style={styles.barLabel}>{t.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Donut-style breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Category Breakdown</Text>
          <Text style={styles.cardTitle}>Where your money goes</Text>
          <View style={{ height: 16 }} />
          {breakdown.slice(0, 6).map((cat: any, i: number) => {
            const pct = totalSpend > 0 ? (cat.amount / totalSpend) * 100 : 0;
            return (
              <View key={cat.id ?? i} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }]} />
                <Text style={styles.catName}>{cat.name}</Text>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }]} />
                </View>
                <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
                <Text style={styles.catAmt}>{formatINR(cat.amount, 0)}</Text>
              </View>
            );
          })}
        </View>

        {/* AI Insights */}
        {insights.length > 0 && (
          <View style={styles.card}>
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles" size={16} color={Colors.warning} />
              <Text style={styles.cardLabel}>AI Financial Advisor</Text>
            </View>
            <Text style={styles.cardTitle}>Smart Recommendations</Text>
            <View style={{ height: 16 }} />
            {insights.map((ins: string, i: number) => (
              <View key={i} style={styles.insightRow}>
                <View style={styles.insightBullet}>
                  <Text style={styles.insightNum}>{i + 1}</Text>
                </View>
                <Text style={styles.insightTxt}>{ins}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },

  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageLabel:  { fontSize: 12, color: Colors.textMuted, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  pageTitle:  { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.5 },
  headerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.primary + "30", alignItems: "center", justifyContent: "center" },

  // KPI Row
  kpiRow:    { flexDirection: "row", gap: 10, marginBottom: 20 },
  kpiCard:   { flex: 1, backgroundColor: Colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.surfaceBorder },
  kpiLabel:  { fontSize: 10, color: Colors.textMuted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  kpiValue:  { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 4 },
  kpiChange: { fontSize: 11, color: Colors.textMuted, fontWeight: "500" },

  // Card
  card:       { backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.surfaceBorder },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  cardLabel:  { fontSize: 11, color: Colors.textMuted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
  cardTitle:  { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },

  // Range selector
  rangeRow:       { flexDirection: "row", backgroundColor: Colors.surfaceElevated, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: Colors.surfaceBorder },
  rangeBtn:       { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  rangeBtnActive: { backgroundColor: Colors.primary },
  rangeTxt:       { fontSize: 11, fontWeight: "700", color: Colors.textMuted },
  rangeTxtActive: { color: "#fff" },

  // Bar chart
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 8 },
  barCol:   { flex: 1, alignItems: "center" },
  barAmt:   { fontSize: 9, color: Colors.textMuted, marginBottom: 4, fontWeight: "600" },
  barWrap:  { width: "100%", height: 80, justifyContent: "flex-end", borderRadius: 4, overflow: "hidden" },
  barFill:  { width: "100%", borderRadius: 4 },
  barLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 6, fontWeight: "600" },

  // Category
  catRow:      { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  catDot:      { width: 10, height: 10, borderRadius: 5 },
  catName:     { fontSize: 13, color: Colors.textSecondary, fontWeight: "600", width: 80 },
  catBarTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.surfaceBorder, overflow: "hidden" },
  catBarFill:  { height: "100%", borderRadius: 3 },
  catPct:      { fontSize: 12, color: Colors.textMuted, width: 30, textAlign: "right" },
  catAmt:      { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, width: 52, textAlign: "right" },

  // Insights
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  insightRow:    { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  insightBullet: { width: 24, height: 24, borderRadius: 8, backgroundColor: Colors.warning + "20", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  insightNum:    { fontSize: 11, fontWeight: "800", color: Colors.warning },
  insightTxt:    { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
});


