import React, { useState, useRef, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, TextInput, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useExpenses } from "@/features/expense/hooks/useExpenses";
import { ExpenseCard } from "@/features/expense/components/ExpenseCard";
import { ExpenseForm } from "@/features/expense/components/ExpenseForm";
import { Colors } from "@/constants/theme";
import { formatINR } from "@/utils/currency";

export default function ExpensesScreen() {
  const [search, setSearch] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%", "92%"], []);

  const {
    expenses, isLoading, hasNextPage, fetchNextPage,
    isFetchingNextPage, refetch, isRefetching, create, update, delete: remove,
  } = useExpenses({ title: search });

  const openCreate = () => { setSelectedExpense(null); bottomSheetRef.current?.expand(); };
  const openEdit   = (exp: any) => { setSelectedExpense(exp); bottomSheetRef.current?.expand(); };
  const onSubmit   = (data: any) => {
    selectedExpense ? update({ id: selectedExpense.id, data }) : create(data);
    bottomSheetRef.current?.close();
  };

  const totalThisMonth = expenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageLabel}>Activity</Text>
          <Text style={styles.pageTitle}>Transactions</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary pill */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="trending-down" size={14} color={Colors.danger} />
          <Text style={styles.summaryText}>{formatINR(totalThisMonth)} spent</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="list-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.summaryText}>{expenses?.length ?? 0} transactions</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={17} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={17} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExpenseCard expense={item} onPress={() => openEdit(item)} onDelete={() => remove(item.id)} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage
            ? <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 20 }} />
            : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>Tap + to log your first expense</Text>
            </View>
          ) : (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
          )
        }
      />

      {/* Floating action button */}
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {selectedExpense ? "Edit Transaction" : "New Transaction"}
            </Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.sheetClose}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ExpenseForm initialValues={selectedExpense} onSubmit={onSubmit} loading={isLoading} />
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: Colors.bg },
  header:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8, marginBottom: 16 },
  pageLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.5 },
  addBtn:    {
    width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },

  summaryRow:  { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  summaryCard: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.surfaceBorder },
  summaryText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },

  searchWrap:  { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: 14, marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 14, paddingVertical: 2, borderWidth: 1, borderColor: Colors.surfaceBorder },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, height: 46, fontSize: 15, color: Colors.textPrimary },

  list: { paddingHorizontal: 20, paddingBottom: 120 },

  empty:      { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyIcon:  { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  emptySub:   { fontSize: 14, color: Colors.textMuted },

  fab: {
    position: "absolute", bottom: 28, right: 20, width: 60, height: 60,
    borderRadius: 18, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },

  sheetBg:      { backgroundColor: Colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetHandle:  { backgroundColor: Colors.surfaceBorder, width: 40 },
  sheetContent: { flex: 1 },
  sheetHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  sheetTitle:   { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  sheetClose:   { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
});
