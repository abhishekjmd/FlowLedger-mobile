import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { getApiErrorMessage } from "@/api/client";

interface ApiErrorStateProps {
  error: unknown;
  onRetry: () => void;
  title?: string;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  error,
  onRetry,
  title = "Could not load data",
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={34} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{getApiErrorMessage(error)}</Text>
      <Button title="Retry" variant="ghost" size="md" onPress={onRetry} style={styles.retry} />
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 28, paddingTop: 56, gap: 10 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  message: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  retry: { marginTop: 10 },
});
