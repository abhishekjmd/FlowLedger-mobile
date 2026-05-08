import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Colors } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? Colors.danger + "80" : Colors.surfaceBorder,
      error ? Colors.danger : Colors.primary,
    ],
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft, rightIcon && styles.inputWithRight, style]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </Animated.View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputWithLeft: { paddingLeft: 4 },
  inputWithRight: { paddingRight: 4 },
  icon: { paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  error: { fontSize: 12, color: Colors.danger, marginTop: 6, fontWeight: "500" },
  hint:  { fontSize: 12, color: Colors.textMuted, marginTop: 6 },
});
