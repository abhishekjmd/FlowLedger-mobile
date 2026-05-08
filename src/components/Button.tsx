import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
  View,
} from "react-native";
import { Colors } from "@/constants/theme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  loading,
  variant = "primary",
  size = "lg",
  disabled,
  icon,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]];

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? Colors.primary : "#fff"} />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: { marginRight: 8 },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  ghost: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  danger: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  // Sizes
  size_sm: { paddingVertical: 10, paddingHorizontal: 20 },
  size_md: { paddingVertical: 14, paddingHorizontal: 24 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 28 },

  disabled: { opacity: 0.45 },

  // Labels
  label: { fontWeight: "700" },
  label_primary:   { color: "#fff" },
  label_secondary: { color: Colors.textPrimary },
  label_ghost:     { color: Colors.primary },
  label_danger:    { color: "#fff" },
  labelSize_sm:    { fontSize: 14 },
  labelSize_md:    { fontSize: 15 },
  labelSize_lg:    { fontSize: 16, letterSpacing: 0.3 },
});
