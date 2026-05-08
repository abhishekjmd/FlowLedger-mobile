import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useTheme } from "@/hooks/useTheme";
import { formatINR } from "@/utils/currency";

const CATEGORY_ICONS: Record<string, string> = {
  Food: "fast-food-outline", Transport: "car-outline",
  Shopping: "bag-outline", Health: "medical-outline",
  Entertainment: "film-outline", Bills: "receipt-outline",
  Travel: "airplane-outline", Education: "school-outline",
};

interface ExpenseCardProps {
  expense: any;
  onPress: () => void;
  onDelete: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress, onDelete }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const CATEGORY_COLORS: Record<string, string> = {
    Food: colors.warning, Transport: "#8B5CF6", Shopping: colors.danger,
    Health: colors.accent, Entertainment: "#EC4899", Bills: colors.primary,
    Travel: "#0EA5E9", Education: colors.accent,
  };

  const catName = expense.category?.name ?? "Other";
  const icon    = (CATEGORY_ICONS[catName] ?? "receipt-outline") as any;
  const color   = CATEGORY_COLORS[catName] ?? colors.primary;
  const amount  = Number(expense.amount);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.75}>
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{expense.title}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.catPill, { backgroundColor: color + "18" }]}>
            <Text style={[styles.catText, { color }]}>{catName}</Text>
          </View>
          <Text style={styles.date}>{format(new Date(expense.date), "MMM d")}</Text>
          {expense.group && (
            <>
              <Text style={styles.dot}>·</Text>
              <Ionicons name="people-outline" size={11} color={colors.textMuted} />
            </>
          )}
        </View>
      </View>

      {/* Amount + delete */}
      <View style={styles.right}>
        <Text style={styles.amount}>-{formatINR(amount)}</Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 12 },
  info:     { flex: 1 },
  title:    { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
  metaRow:  { flexDirection: "row", alignItems: "center", gap: 6 },
  catPill:  { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  catText:  { fontSize: 11, fontWeight: "700" },
  date:     { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
  dot:      { fontSize: 12, color: colors.textMuted },
  right:    { alignItems: "flex-end", gap: 8 },
  amount:   { fontSize: 15, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.3 },
  deleteBtn: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.danger + "15", alignItems: "center", justifyContent: "center" },
});


