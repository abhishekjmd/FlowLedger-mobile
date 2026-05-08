import React from "react";
import { View, Text, ViewProps, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "elevated" | "accent" | "danger";
  noPad?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  rightAction,
  children,
  style,
  variant = "default",
  noPad = false,
  ...props
}) => {
  return (
    <View style={[styles.base, styles[variant], noPad && styles.noPad, style]} {...props}>
      {(title || rightAction) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {rightAction && <View>{rightAction}</View>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  noPad: { padding: 0 },
  default: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.surfaceBorder + "80",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  accent: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary + "30",
  },
  danger: {
    backgroundColor: Colors.dangerMuted,
    borderColor: Colors.danger + "30",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
