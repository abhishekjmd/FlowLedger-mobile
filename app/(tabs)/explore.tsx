import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, TextInput, StatusBar, BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useExpenses } from "@/features/expense/hooks/useExpenses";
import { ExpenseCard } from "@/features/expense/components/ExpenseCard";
import { ExpenseForm } from "@/features/expense/components/ExpenseForm";
import { ApiErrorState } from "@/components/ApiState";
import { useTheme } from "@/hooks/useTheme";
import { formatINR } from "@/utils/currency";

export default function ExpensesScreen() {
  const { group_id } = useLocalSearchParams<{ group_id?: string }>();
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["82%", "96%"], []);
  const tabBarHeight = useBottomTabBarHeight();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

  const defaultGroupId = group_id ? Number(group_id) : undefined;
  const filters = useMemo(
    () => ({
      ...(search.trim() ? { title: search.trim() } : {}),
      ...(defaultGroupId ? { group_id: defaultGroupId } : {}),
    }),
    [defaultGroupId, search]
  );

  const {
    expenses, isLoading, hasNextPage, fetchNextPage,
    isFetchingNextPage, isError, error, refetch, isRefetching, create, update, delete: remove,
  } = useExpenses(filters);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isSheetOpen ? { display: "none" } : undefined,
    });

    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [isSheetOpen, navigation]);

  const handleSheetChange = useCallback((index: number) => {
    setIsSheetOpen(index >= 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!defaultGroupId) return undefined;

      const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => {
        router.replace(`/(groups)/${defaultGroupId}` as any);
        return true;
      });

      return () => {
        backSubscription.remove();
        router.setParams({ group_id: undefined });
      };
    }, [defaultGroupId])
  );

  const openCreate = () => { setSelectedExpense(null); bottomSheetRef.current?.expand(); };
  const openEdit   = (exp: any) => { setSelectedExpense(exp); bottomSheetRef.current?.expand(); };
  const onSubmit   = (data: any) => {
    if (selectedExpense) {
      update({ id: selectedExpense.id, data });
    } else {
      create(data);
    }
    bottomSheetRef.current?.close();
  };

  const totalThisMonth = expenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

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
          <Ionicons name="trending-down" size={14} color={colors.danger} />
          <Text style={styles.summaryText}>{formatINR(totalThisMonth)} spent</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="list-outline" size={14} color={colors.textMuted} />
          <Text style={styles.summaryText}>{expenses?.length ?? 0} transactions</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={17} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={17} color={colors.textMuted} />
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage
            ? <ActivityIndicator color={colors.primary} style={{ paddingVertical: 20 }} />
            : null
        }
        ListEmptyComponent={
          isError ? (
            <ApiErrorState error={error} onRetry={refetch} title="Could not load transactions" />
          ) : !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>Tap + to log your first expense</Text>
            </View>
          ) : (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
          )
        }
      />

      {/* Floating action button */}
      <TouchableOpacity style={[styles.fab, { bottom: tabBarHeight + 16 }]} onPress={openCreate} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        style={styles.sheet}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} pressBehavior="close" />
        )}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {selectedExpense ? "Edit Transaction" : "New Transaction"}
            </Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.sheetClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ExpenseForm
            initialValues={selectedExpense ?? (defaultGroupId ? { group_id: defaultGroupId } : undefined)}
            onSubmit={onSubmit}
            loading={isLoading}
          />
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.bg },
  header:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8, marginBottom: 16 },
  pageLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  addBtn:    {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },

  summaryRow:  { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  summaryCard: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.surfaceBorder },
  summaryText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },

  searchWrap:  { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 14, paddingVertical: 2, borderWidth: 1, borderColor: colors.surfaceBorder },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, height: 46, fontSize: 15, color: colors.textPrimary },

  list: { paddingHorizontal: 20, paddingBottom: 120 },

  empty:      { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyIcon:  { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  emptySub:   { fontSize: 14, color: colors.textMuted },

  fab: {
    position: "absolute", right: 20, width: 60, height: 60,
    borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },

  sheet:        { zIndex: 20, elevation: 20 },
  sheetBg:      { backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetHandle:  { backgroundColor: colors.surfaceBorder, width: 40 },
  sheetContent: { flex: 1 },
  sheetHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  sheetTitle:   { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  sheetClose:   { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
});
