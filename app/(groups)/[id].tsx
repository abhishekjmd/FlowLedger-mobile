import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGroupDetails } from "@/features/expense/hooks/useGroups";
import { Button } from "@/components/Button";
import { Colors } from "@/constants/theme";
import { toast } from "@/lib/toast";

const TABS = ["Activity", "Balances"] as const;
type Tab = typeof TABS[number];

const GROUP_COLORS = [Colors.primary, "#8B5CF6", Colors.accent, Colors.warning, Colors.danger, "#EC4899"];

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { group, isLoading, refetch, settle, isSettling } = useGroupDetails(id!);
  const [tab, setTab] = useState<Tab>("Activity");

  const handleSettle = (balance: any) => {
    if (balance.netBalance >= 0) return;
    settle({
      payer_id: balance.userId,
      receiver_id: group.owner_id,
      amount: Math.abs(balance.netBalance),
    });
    toast.info(`Recording payment of ₹${Math.abs(balance.netBalance).toFixed(2)} from ${balance.name}`);
  };

  if (isLoading || !group) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <View style={styles.loadingPulse} />
          <View style={[styles.loadingPulse, { width: "60%", marginTop: 12 }]} />
        </View>
      </SafeAreaView>
    );
  }

  const totalSpend = group.expenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
          <Text style={styles.groupMeta}>{group.members?.length ?? 0} members</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hero stats */}
      <View style={styles.heroRow}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Spent</Text>
          <Text style={styles.heroValue}>₹{totalSpend.toFixed(2)}</Text>
        </View>
        <View style={[styles.heroCard, { backgroundColor: Colors.accent + "12", borderColor: Colors.accent + "30" }]}>
          <Text style={styles.heroLabel}>Expenses</Text>
          <Text style={[styles.heroValue, { color: Colors.accent }]}>{group.expenses?.length ?? 0}</Text>
        </View>
        <View style={[styles.heroCard, { backgroundColor: "#8B5CF620", borderColor: "#8B5CF630" }]}>
          <Text style={styles.heroLabel}>Settled</Text>
          <Text style={[styles.heroValue, { color: "#8B5CF6" }]}>{group.settlements?.length ?? 0}</Text>
        </View>
      </View>

      {/* Members row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersRow}>
        {group.members?.map((m: any, i: number) => (
          <View key={m.user_id} style={styles.memberChip}>
            <View style={[styles.memberAvatar, { backgroundColor: GROUP_COLORS[i % GROUP_COLORS.length] + "25" }]}>
              <Text style={[styles.memberInitial, { color: GROUP_COLORS[i % GROUP_COLORS.length] }]}>
                {m.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.memberName} numberOfLines={1}>{m.user.name.split(" ")[0]}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.memberAddChip}>
          <Ionicons name="person-add-outline" size={16} color={Colors.primary} />
          <Text style={styles.memberAddText}>Invite</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {tab === "Activity" ? (
          <>
            {group.expenses?.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="receipt-outline" size={40} color={Colors.surfaceBorder} />
                <Text style={styles.emptyText}>No group expenses yet</Text>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/(tabs)/explore", params: { group_id: id } })}
                >
                  <Text style={styles.emptyLink}>Add first expense →</Text>
                </TouchableOpacity>
              </View>
            )}
            {group.expenses?.map((exp: any) => (
              <View key={exp.id} style={styles.txnRow}>
                <View style={styles.txnIcon}>
                  <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnTitle} numberOfLines={1}>{exp.title}</Text>
                  <Text style={styles.txnMeta}>
                    Paid by {exp.user?.name ?? "Unknown"} · {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Text>
                </View>
                <Text style={styles.txnAmt}>₹{Number(exp.amount).toFixed(2)}</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            {group.balances?.map((bal: any, i: number) => {
              const isOwed = bal.netBalance >= 0;
              return (
                <View key={bal.userId} style={styles.balanceRow}>
                  <View style={[styles.balanceAvatar, { backgroundColor: GROUP_COLORS[i % GROUP_COLORS.length] + "20" }]}>
                    <Text style={[styles.balanceInitial, { color: GROUP_COLORS[i % GROUP_COLORS.length] }]}>
                      {bal.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceName}>{bal.name}</Text>
                    <Text style={[styles.balanceStatus, { color: isOwed ? Colors.accent : Colors.danger }]}>
                      {isOwed ? `Is owed ₹${bal.netBalance.toFixed(2)}` : `Owes ₹${Math.abs(bal.netBalance).toFixed(2)}`}
                    </Text>
                    {/* Progress bar */}
                    <View style={styles.balanceBarTrack}>
                      <View style={[styles.balanceBarFill, {
                        width: `${Math.min(100, Math.abs(bal.netBalance) / Math.max(1, totalSpend / (group.members?.length ?? 1)) * 100)}%`,
                        backgroundColor: isOwed ? Colors.accent : Colors.danger,
                      }]} />
                    </View>
                  </View>
                  {!isOwed && (
                    <Button
                      title="Settle"
                      variant="ghost"
                      size="sm"
                      loading={isSettling}
                      onPress={() => handleSettle(bal)}
                    />
                  )}
                  {isOwed && (
                    <View style={styles.owedBadge}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add expense FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: "/(tabs)/explore", params: { group_id: id } } as any)}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 80 },

  // Header
  header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  backBtn:      { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  groupName:    { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.3 },
  groupMeta:    { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  settingsBtn:  { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder, alignItems: "center", justifyContent: "center" },

  // Hero stats
  heroRow:   { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  heroCard:  { flex: 1, backgroundColor: Colors.primaryMuted, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.primary + "30" },
  heroLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  heroValue: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.5 },

  // Members
  membersRow:    { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  memberChip:    { alignItems: "center", gap: 6 },
  memberAvatar:  { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  memberInitial: { fontSize: 17, fontWeight: "800" },
  memberName:    { fontSize: 11, color: Colors.textMuted, fontWeight: "600", maxWidth: 52 },
  memberAddChip: { alignItems: "center", gap: 6, opacity: 0.7 },
  memberAddText: { fontSize: 11, color: Colors.primary, fontWeight: "600" },

  // Tabs
  tabBar:       { flexDirection: "row", marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: Colors.surfaceBorder },
  tab:          { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabActive:    { backgroundColor: Colors.primary },
  tabText:      { fontSize: 14, fontWeight: "700", color: Colors.textMuted },
  tabTextActive: { color: "#fff" },

  // Transactions
  txnRow:  { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder + "60" },
  txnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center", marginRight: 12 },
  txnInfo: { flex: 1 },
  txnTitle: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary },
  txnMeta:  { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  txnAmt:   { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },

  // Balances
  balanceRow:     { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder + "60", gap: 12 },
  balanceAvatar:  { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  balanceInitial: { fontSize: 17, fontWeight: "800" },
  balanceInfo:    { flex: 1 },
  balanceName:    { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, marginBottom: 2 },
  balanceStatus:  { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  balanceBarTrack: { height: 4, borderRadius: 2, backgroundColor: Colors.surfaceBorder, overflow: "hidden" },
  balanceBarFill:  { height: "100%", borderRadius: 2 },
  owedBadge:      { padding: 4 },

  // Empty
  empty:     { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
  emptyLink: { fontSize: 14, color: Colors.primary, fontWeight: "700", marginTop: 4 },

  // Loading skeleton
  loadingWrap:  { padding: 24 },
  loadingPulse: { height: 20, backgroundColor: Colors.surface, borderRadius: 8, width: "80%" },

  // FAB
  fab: {
    position: "absolute", bottom: 28, right: 20, width: 56, height: 56,
    borderRadius: 16, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
});
