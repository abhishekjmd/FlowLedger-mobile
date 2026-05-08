import React, { useRef, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useGroups } from "@/features/expense/hooks/useGroups";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ApiErrorState } from "@/components/ApiState";
import { useTheme } from "@/hooks/useTheme";



export default function GroupsScreen() {
  const { groups, isLoading, isError, error, isRefetching, refetch, create, isCreating } = useGroups();
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["55%"], []);
  const tabBarHeight = useBottomTabBarHeight();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

  const GROUP_COLORS = [colors.primary, "#8B5CF6", colors.accent, colors.warning, colors.danger, "#EC4899"];

  const handleCreate = () => {
    if (!groupName.trim()) return;
    create({ name: groupName.trim(), description: groupDesc.trim() || undefined, member_ids: [] });
    setGroupName(""); setGroupDesc("");
    bottomSheetRef.current?.close();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageLabel}>Collaborative</Text>
          <Text style={styles.pageTitle}>Groups</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => bottomSheetRef.current?.expand()}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Groups list */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 24 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        renderItem={({ item, index }) => {
          const color = GROUP_COLORS[index % GROUP_COLORS.length];
          const initial = item.name.charAt(0).toUpperCase();
          return (
            <TouchableOpacity
              style={styles.groupCard}
              onPress={() => router.push(`/(groups)/${item.id}` as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.groupAvatar, { backgroundColor: color + "20", borderColor: color + "40" }]}>
                <Text style={[styles.groupInitial, { color }]}>{initial}</Text>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupMeta}>
                  {item.members?.length ?? 0} members · {item._count?.expenses ?? 0} expenses
                </Text>
              </View>
              <View style={styles.groupChevron}>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isError ? (
            <ApiErrorState error={error} onRetry={refetch} title="Could not load groups" />
          ) : !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No groups yet</Text>
              <Text style={styles.emptySub}>Create a group to split bills with friends</Text>
              <Button
                title="Create First Group"
                variant="ghost"
                size="md"
                onPress={() => bottomSheetRef.current?.expand()}
                style={{ marginTop: 16 }}
              />
            </View>
          ) : (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
          )
        }
      />

      {/* Create Group Sheet */}
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
            <Text style={styles.sheetTitle}>New Group</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.sheetClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.sheetBody}>
            <Input
              label="Group Name"
              placeholder="e.g. Barcelona Trip 2025"
              value={groupName}
              onChangeText={setGroupName}
              leftIcon={<Ionicons name="people-outline" size={17} color={colors.textMuted} />}
            />
            <Input
              label="Description (Optional)"
              placeholder="What's this group for?"
              value={groupDesc}
              onChangeText={setGroupDesc}
              leftIcon={<Ionicons name="document-text-outline" size={17} color={colors.textMuted} />}
            />
            <Button
              title="Create Group"
              onPress={handleCreate}
              loading={isCreating}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8, marginBottom: 24 },
  pageLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  addBtn: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  list: { paddingHorizontal: 20 },

  groupCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  groupAvatar:  { width: 50, height: 50, borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginRight: 14 },
  groupInitial: { fontSize: 20, fontWeight: "800" },
  groupInfo:    { flex: 1 },
  groupName:    { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 3 },
  groupMeta:    { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  groupChevron: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surfaceElevated, alignItems: "center", justifyContent: "center" },

  empty:      { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyIcon:  { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  emptySub:   { fontSize: 14, color: colors.textMuted, textAlign: "center", paddingHorizontal: 40 },

  sheetBg:      { backgroundColor: colors.bg },
  sheetHandle:  { backgroundColor: colors.surfaceBorder, width: 40 },
  sheetContent: { flex: 1 },
  sheetHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  sheetTitle:   { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  sheetClose:   { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  sheetBody:    { padding: 24 },
});
