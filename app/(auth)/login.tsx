import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { extractClerkError } from "@/utils/clerkErrors";
import { apiClient } from "@/api/client";

WebBrowser.maybeCompleteAuthSession();

const loginSchema = z.object({
  email_username: z.string().email("Invalid email address"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { inviteToken } = useLocalSearchParams<{ inviteToken?: string }>();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handlePostAuthJoin = async () => {
    if (!inviteToken) return;
    try {
      await apiClient.post("/expenses/groups/invites/accept", { token: inviteToken });
    } catch (error) {
      console.warn("Failed to auto-join group after login:", error);
    }
  };

  const onLogin = async (data: LoginForm) => {
    if (!isLoaded) return;
    setIsLoggingIn(true);
    try {
      const result = await signIn.create({
        identifier: data.email_username,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await handlePostAuthJoin();
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: extractClerkError(err),
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { createdSessionId, setActive: activate } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/", { scheme: "flowledgermobile" }),
      });

      if (createdSessionId && activate) {
        await activate({ session: createdSessionId });
        await handlePostAuthJoin();
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Google sign-in failed",
        text2: extractClerkError(err),
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo mark */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Ionicons name="trending-up" size={28} color="#fff" />
            </View>
            <Text style={styles.logoText}>FlowLedger</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Welcome back</Text>
            <Text style={styles.heroSub}>Sign in to continue managing your finances</Text>
          </View>

          {/* Google OAuth */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={onGoogleLogin}
            disabled={isGoogleLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
            <Text style={styles.googleText}>
              {isGoogleLoading ? "Connecting…" : "Continue with Google"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or sign in with email</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.form}>
            <Controller control={control} name="email_username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email_username?.message}
                  leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
                />
              )}
            />

            <Controller control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPass}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      <Ionicons
                        name={showPass ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={handleSubmit(onLogin)}
              loading={isLoggingIn}
              style={styles.cta}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don{"'"}t have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Create account</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Trust badges */}
          <View style={styles.trust}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
            <Text style={styles.trustText}>256-bit encrypted · SOC 2 compliant</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  flex:    { flex: 1 },
  scroll:  { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },
  logoWrap: { flexDirection: "row", alignItems: "center", marginBottom: 48 },
  logoBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
    marginRight: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10,
  },
  logoText: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  hero:     { marginBottom: 28 },
  heroTitle: { fontSize: 34, fontWeight: "800", color: colors.textPrimary, letterSpacing: -1, marginBottom: 8 },
  heroSub:   { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },

  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.surfaceBorder,
    borderRadius: 14, paddingVertical: 15, marginBottom: 20,
  },
  googleText: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },

  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 10 },
  divider:    { flex: 1, height: 1, backgroundColor: colors.surfaceBorder },
  dividerText: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },

  form:      { marginBottom: 24 },
  cta:       { marginTop: 4 },
  footer:    { flexDirection: "row", justifyContent: "center", marginBottom: 24 },
  footerText: { color: colors.textSecondary, fontSize: 15 },
  footerLink: { color: colors.primary, fontWeight: "700", fontSize: 15 },
  trust:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  trustText: { fontSize: 12, color: colors.textMuted, letterSpacing: 0.3 },
});
