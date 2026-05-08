import React, { useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { extractClerkError } from "@/utils/clerkErrors";
import { apiClient } from "@/api/client";

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { inviteToken } = useLocalSearchParams<{ inviteToken?: string }>();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const codeString = code.join("");

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = "";
      setCode(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onVerify = async () => {
    if (!isLoaded || codeString.length < CODE_LENGTH) return;
    setIsVerifying(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: codeString });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        if (inviteToken) {
          try {
            await apiClient.post("/expenses/groups/invites/accept", { token: inviteToken });
          } catch (e) {
            console.warn("Auto-join failed after verification:", e);
          }
        }
        
        router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Verification failed",
          text2: "Please check the code and try again.",
        });
      }
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: extractClerkError(err),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    if (!isLoaded) return;
    setIsResending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Toast.show({
        type: "success",
        text1: "Code resent",
        text2: "Check your inbox for a new verification code.",
      });
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Could not resend",
        text2: extractClerkError(err),
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={36} color={colors.primary} />
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{"\n"}
          <Text style={styles.email}>{signUp?.emailAddress ?? "your email"}</Text>
        </Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {Array(CODE_LENGTH).fill(null).map((_, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpBox,
                code[i] ? styles.otpBoxFilled : null,
              ]}
              value={code[i]}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              selectionColor={colors.primary}
            />
          ))}
        </View>

        <Button
          title="Verify Email"
          onPress={onVerify}
          loading={isVerifying}
          disabled={codeString.length < CODE_LENGTH}
          style={styles.cta}
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn{"'"}t receive it? </Text>
          <TouchableOpacity onPress={onResend} disabled={isResending}>
            <Text style={styles.resendLink}>
              {isResending ? "Sending…" : "Resend code"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 16 },
  back:      { marginBottom: 40 },

  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: colors.primary + "15",
    alignItems: "center", justifyContent: "center",
    marginBottom: 24,
    alignSelf: "center",
  },

  title:    { fontSize: 30, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.8, textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 36 },
  email:    { color: colors.primary, fontWeight: "600" },

  otpRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 32 },
  otpBox: {
    width: 48, height: 56, borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.surfaceBorder,
    fontSize: 22, fontWeight: "700", color: colors.textPrimary,
    textAlign: "center",
  },
  otpBoxFilled: { borderColor: colors.primary },

  cta: { marginBottom: 20 },

  resendRow: { flexDirection: "row", justifyContent: "center" },
  resendText: { color: colors.textSecondary, fontSize: 14 },
  resendLink: { color: colors.primary, fontWeight: "700", fontSize: 14 },
});
