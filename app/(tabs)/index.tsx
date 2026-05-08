import React from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, StatusBar, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDashboard } from "@/hooks/useDashboard";
import { useUser } from "@clerk/clerk-expo";
import { Colors } from "@/constants/theme";
import { formatINR } from "@/utils/currency";

const { width } = Dimensions.get("window");

const QUICK_ACTIONS = [
  { icon: "add-circle",      label: "Add",      color: Colors.primary,  route: "/(tabs)/explore" },
  { icon: "people",          label: "Groups",   color: "#8B5CF6",       route: "/(tabs)/groups" },
  { icon: "bar-chart",       label: "Analytics",color: Colors.accent,   route: "/(tabs)/analytics" },
  { icon: "repeat",          label: "Recurring",color: Colors.warning,  route: "/(tabs)/explore" },
];

const CATEGORY_ICONS: Record<string, string> = {
  Food: "fast-food-outline", Transport: "car-outline",
  Shopping: "bag-outline", Health: "medical-outline",
  Entertainment: "film-outline", Bills: "receipt-outline",
};

export default function DashboardScreen() {
  const { user } = useUser();
  const displayName = user?.firstName || user?.fullName?.split(" ")[0] || "Member";
  const { summary, categories, insights, recentExpenses, isLoading, isRefetching, refetch } = useDashboard();

  const growthPct = summary?.lastMonth
    ? (((summary.currentMonth - summary.lastMonth) / summary.lastMonth) * 100).toFixed(1)
    : null;
  const isUp = (summary?.difference ?? 0) > 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.username}>{user?.name?.split(" ")[0] ?? "Member"}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Balance Hero Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceBg} />
          <Text style={styles.balanceLabel}>Total Spending · {new Date().toLocaleString("default", { month: "long" })}</Text>
          <Text style={styles.balanceAmount}>
            {formatINR(summary?.currentMonth ?? 0)}
          </Text>
          <View style={styles.balanceMeta}>
            <View style={[styles.badge, isUp ? styles.badgeRed : styles.badgeGreen]}>
              <Ionicons name={isUp ? "trending-up" : "trending-down"} size={13} color={isUp ? Colors.danger : Colors.accent} />
              <Text style={[styles.badgeText, { color: isUp ? Colors.danger : Colors.accent }]}>
                {growthPct ? `${isUp ? "+" : ""}${growthPct}%` : "—"}
              </Text>
            </View>
            <Text style={styles.balanceVs}>vs {formatINR(summary?.lastMonth ?? 0)} last month</Text>
          </View>

          {/* Mini bar chart */}
          <View style={styles.miniBar}>
            <View style={[styles.miniBarFill, { width: `${Math.min(100, ((summary?.currentMonth ?? 0) / Math.max(1, summary?.lastMonth ?? 1)) * 50)}%` }]} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => router.push(a.route as any)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + "18", borderColor: a.color + "30" }]}>
                <Ionicons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Insights Carousel */}
        {insights && insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flow Intelligence</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
              {insights.map((insight: string, i: number) => (
                <View key={i} style={styles.insightCard}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="sparkles" size={16} color={Colors.warning} />
                  </View>
                  <Text style={styles.insightText} numberOfLines={3}>{insight}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Breakdown */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spending Breakdown</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/analytics")}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {categories.slice(0, 4).map((cat: any, i: number) => {
              const total = categories.reduce((s: number, c: any) => s + c.amount, 0);
              const pct = total > 0 ? (cat.amount / total) * 100 : 0;
              return (
                <View key={cat.id ?? i} style={styles.catRow}>
                  <View style={[styles.catIcon, { backgroundColor: Colors.primary + "15" }]}>
                    <Ionicons name={(CATEGORY_ICONS[cat.name] ?? "receipt-outline") as any} size={17} color={Colors.primary} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catMeta}>
                      <Text style={styles.catName}>{cat.name}</Text>
                      <Text style={styles.catAmt}>{formatINR(cat.amount)}</Text>
                    </View>
                    <View style={styles.catBarBg}>
                      <View style={[styles.catBarFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
              <Text style={styles.seeAll}>View all →</Text>
            </TouchableOpacity>
          </View>
          {recentExpenses?.slice(0, 5).map((exp: any) => (
            <View key={exp.id} style={styles.txnRow}>
              <View style={styles.txnIcon}>
                <Ionicons name={(CATEGORY_ICONS[exp.category?.name] ?? "receipt-outline") as any} size={18} color={Colors.primary} />
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnTitle} numberOfLines={1}>{exp.title}</Text>
                <Text style={styles.txnDate}>{new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
              </View>
              <Text style={styles.txnAmt}>-{formatINR(Number(exp.amount))}</Text>
            </View>
          ))}
          {!isLoading && !recentExpenses?.length && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.surfaceBorder} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },

  header:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting:  { fontSize: 14, color: Colors.textMuted, fontWeight: "500", marginBottom: 2 },
  username:  { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.5 },
  notifBtn:  {
    width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.surfaceBorder, alignItems: "center", justifyContent: "center",
  },
  notifDot: {
    position: "absolute", top: 10, right: 10, width: 8, height: 8,
    borderRadius: 4, backgroundColor: Colors.danger, borderWidth: 1.5, borderColor: Colors.bg,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: Colors.primary, borderRadius: 24, padding: 24, marginBottom: 24,
    overflow: "hidden",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12,
  },
  balanceBg: {
    position: "absolute", top: -40, right: -40, width: 160, height: 160,
    borderRadius: 80, backgroundColor: "#ffffff10",
  },
  balanceLabel:  { fontSize: 13, color: "#ffffff90", fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 },
  balanceAmount: { fontSize: 42, fontWeight: "900", color: "#fff", letterSpacing: -1.5, marginBottom: 12 },
  balanceMeta:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  badge:         { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeRed:      { backgroundColor: "#F43F5E25" },
  badgeGreen:    { backgroundColor: "#10B98125" },
  badgeText:     { fontSize: 12, fontWeight: "700" },
  balanceVs:     { fontSize: 13, color: "#ffffff70" },
  miniBar:       { height: 4, borderRadius: 2, backgroundColor: "#ffffff25", overflow: "hidden" },
  miniBarFill:   { height: "100%", borderRadius: 2, backgroundColor: "#ffffffA0" },

  // Quick Actions
  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  actionBtn:  { alignItems: "center", flex: 1 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  actionLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: "600" },

  // Section
  section:       { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle:  { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.3 },
  seeAll:        { fontSize: 13, color: Colors.primary, fontWeight: "600" },

  // Insights
  insightsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  insightCard: {
    width: width * 0.72, backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    marginRight: 12, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  insightIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.warning + "18",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  insightText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  // Category
  catRow:    { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  catIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  catInfo:   { flex: 1 },
  catMeta:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catName:   { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  catAmt:    { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  catBarBg:  { height: 4, borderRadius: 2, backgroundColor: Colors.surfaceBorder, overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 2, backgroundColor: Colors.primary },

  // Transactions
  txnRow:   { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder + "50" },
  txnIcon:  { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center", marginRight: 12 },
  txnInfo:  { flex: 1 },
  txnTitle: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary },
  txnDate:  { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  txnAmt:   { fontSize: 15, fontWeight: "700", color: Colors.danger },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText:  { fontSize: 15, color: Colors.textMuted },
});


