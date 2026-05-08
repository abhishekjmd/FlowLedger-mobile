import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useMetadata } from "../hooks/useMetadata";
import { useTheme } from "@/hooks/useTheme";
import { formatINR } from "@/utils/currency";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().transform((v) => parseFloat(v)).pipe(z.number().positive("Must be a positive number")),
  category_id: z.number({ error: "Select a category" }),
  group_id: z.number().optional(),
  description: z.string().optional(),
});

type ExpenseFormInput = z.input<typeof expenseSchema>;
type ExpenseFormValues = z.output<typeof expenseSchema>;

interface ExpenseFormProps {
  initialValues?: any;
  onSubmit: (data: ExpenseFormValues) => void;
  loading?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: "fast-food-outline", Transport: "car-outline",
  Shopping: "bag-outline", Health: "medical-outline",
  Entertainment: "film-outline", Bills: "receipt-outline",
  Travel: "airplane-outline", Education: "school-outline",
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialValues, onSubmit, loading }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { categories, groups, isCategoriesLoading, isCategoriesFetching, categoriesError, refetchCategories } = useMetadata();
  const { control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<ExpenseFormInput, any, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      amount: initialValues?.amount ? initialValues.amount.toString() : "",
      category_id: initialValues?.category_id,
      group_id: initialValues?.group_id,
      description: initialValues?.description ?? "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      const nextCategoryId = initialValues.category_id ?? categories[0]?.id;
      reset({
        title: initialValues.title ?? "",
        amount: initialValues.amount?.toString?.() ?? "",
        category_id: nextCategoryId,
        group_id: initialValues.group_id,
        description: initialValues.description ?? "",
      });
      return;
    }

    const selectedCategory = getValues("category_id");
    if (!selectedCategory && categories.length > 0) {
      setValue("category_id", categories[0].id);
    }
  }, [initialValues, categories, getValues, reset, setValue]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.amountWrap}>
        <Text style={styles.currencySign}>INR {"\u20B9"}</Text>
        <View style={styles.amountInputWrap}>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="0.00"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.amount?.message}
                style={styles.amountInput}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Description"
            placeholder="What was this for?"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.title?.message}
            leftIcon={<Ionicons name="create-outline" size={17} color={colors.textMuted} />}
          />
        )}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Category</Text>
        {errors.category_id && <Text style={styles.errorText}>{errors.category_id.message as string}</Text>}
        {!isCategoriesLoading && categories.length === 0 && (
          <View style={styles.categoryErrorWrap}>
            <Text style={styles.errorText}>
              {categoriesError ? "Could not load categories. Please retry." : "No categories available. Please try again."}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetchCategories()}
              disabled={isCategoriesFetching}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>{isCategoriesFetching ? "Retrying..." : "Retry"}</Text>
            </TouchableOpacity>
          </View>
        )}
        <Controller
          control={control}
          name="category_id"
          render={({ field: { onChange, value } }) => (
            <View style={styles.catGrid}>
              {categories.map((cat: any) => {
                const isActive = value === cat.id;
                const icon = (CATEGORY_ICONS[cat.name] ?? "receipt-outline") as any;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, isActive && styles.catChipActive]}
                    onPress={() => onChange(cat.id)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={icon} size={16} color={isActive ? colors.primary : colors.textMuted} />
                    <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      </View>

      {groups?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Group (Optional)</Text>
          <Controller
            control={control}
            name="group_id"
            render={({ field: { onChange, value } }) => (
              <View style={styles.groupRow}>
                <TouchableOpacity
                  style={[styles.groupChip, !value && styles.groupChipActive]}
                  onPress={() => onChange(undefined)}
                >
                  <Text style={[styles.groupChipText, !value && styles.groupChipTextActive]}>Personal</Text>
                </TouchableOpacity>
                {groups.map((g: any) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.groupChip, value === g.id && styles.groupChipActive]}
                    onPress={() => onChange(g.id)}
                  >
                    <Text style={[styles.groupChipText, value === g.id && styles.groupChipTextActive]}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>
      )}

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Notes (Optional)"
            placeholder="Any additional details..."
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: "top" }}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            leftIcon={<Ionicons name="document-text-outline" size={17} color={colors.textMuted} />}
          />
        )}
      />

      <Button
        title={initialValues ? "Update Transaction" : "Save Transaction"}
        onPress={handleSubmit(onSubmit)}
        loading={loading || isCategoriesLoading}
        disabled={isCategoriesLoading || categories.length === 0}
        style={styles.cta}
      />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16 },

  amountWrap: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  amountInputWrap: { flex: 1 },
  currencySign: { fontSize: 24, fontWeight: "800", color: colors.textSecondary, marginRight: 8 },
  amountInput: { fontSize: 32, fontWeight: "800", color: colors.textPrimary },

  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
  errorText: { fontSize: 12, color: colors.danger, fontWeight: "500", marginTop: -6, marginBottom: 8 },
  categoryErrorWrap: { marginBottom: 10 },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retryBtnText: { color: colors.textSecondary, fontWeight: "700", fontSize: 12 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.surfaceBorder,
  },
  catChipActive: { backgroundColor: colors.primary + "15", borderColor: colors.primary },
  catChipText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  catChipTextActive: { color: colors.primary },

  groupRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  groupChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.surfaceBorder },
  groupChipActive: { backgroundColor: colors.primary + "15", borderColor: colors.primary },
  groupChipText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  groupChipTextActive: { color: colors.primary },

  cta: { marginTop: 8 },
});


