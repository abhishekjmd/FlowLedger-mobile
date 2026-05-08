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
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { extractClerkError } from "@/utils/clerkErrors";
import { apiClient } from "@/api/client";

WebBrowser.maybeCompleteAuthSession();

const signupSchema = z.object({
  name:     z.string().min(2, "Name is too short"),
  email:    z.string().email("Invalid email address"),
  username: z.string().min(3, "At least 3 characters").regex(/^[a-z0-9_]+$/, "Lowercase, numbers and _ only"),
  password: z.string().min(8, "Minimum 8 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

const PERKS = [
  { icon: "analytics-outline", text: "AI-powered insights" },
  { icon: "people-outline",    text: "Split bills with groups" },
  { icon: "repeat-outline",    text: "Recurring expense tracking" },
];

export default function SignupScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { inviteToken } = useLocalSearchParams<{ inviteToken?: string }>();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const handlePostAuthJoin = async () => {
    if (!inviteToken) return;
    try {
      await apiClient.post("/expenses/groups/invites/accept", { token: inviteToken });
    } catch (error) {
      console.warn("Failed to auto-join group after signup:", error);
    }
  };

  const onSignup = async (data: SignupForm) => {
    if (!isLoaded) return;
    setIsSigningUp(true);
    try {
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" ") || "",
        unsafeMetadata: {
          username: data.username,
        },
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await handlePostAuthJoin();
        router.replace("/(tabs)");
      } else if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        router.push({ pathname: "/(auth)/verify-email", params: { inviteToken } } as any);
      }
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: extractClerkError(err),
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const onGoogleSignUp = async () => {
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
        text1: "Google sign-up failed",
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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Ionicons name="trending-up" size={22} color="#fff" />
            </View>
            <Text style={styles.logoText}>FlowLedger</Text>
          </View>

          <Text style={styles.heroTitle}>Create your{"\n"}account</Text>
          <Text style={styles.heroSub}>Start tracking smarter, spending wiser.</Text>

          {/* Perk pills */}
          <View style={styles.perks}>
            {PERKS.map((p) => (
              <View key={p.icon} style={styles.perkItem}>
                <Ionicons name={p.icon as "analytics-outline"} size={13} color={colors.accent} />
                <Text style={styles.perkText}>{p.text}</Text>
              </View>
            ))}
          </View>

          {/* Google OAuth */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={onGoogleSignUp}
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
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.form}>
            <Controller control={control} name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Full Name" placeholder="Jane Smith"
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  error={errors.name?.message}
                  leftIcon={<Ionicons name="person-outline" size={17} color={colors.textMuted} />}
                />
              )}
            />
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Email Address" placeholder="jane@company.com"
                  autoCapitalize="none" keyboardType="email-address"
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  error={errors.email?.message}
                  leftIcon={<Ionicons name="mail-outline" size={17} color={colors.textMuted} />}
                />
              )}
            />
            <Controller control={control} name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Username" placeholder="jane_smith"
                  autoCapitalize="none"
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  error={errors.username?.message}
                  hint="Lowercase letters, numbers and underscores only"
                  leftIcon={<Ionicons name="at-outline" size={17} color={colors.textMuted} />}
                />
              )}
            />
            <Controller control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Password" placeholder="Min 8 characters"
                  secureTextEntry={!showPass}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  error={errors.password?.message}
                  leftIcon={<Ionicons name="lock-closed-outline" size={17} color={colors.textMuted} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={17} color={colors.textMuted} />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            <Button title="Create Free Account" onPress={handleSubmit(onSignup)} loading={isSigningUp} style={styles.cta} />

            <Text style={styles.terms}>
              By creating an account, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  flex:      { flex: 1 },
  scroll:    { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },
  header:    { flexDirection: "row", alignItems: "center", marginBottom: 40 },
  logoBox:   {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginRight: 10,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  logoText:  { fontSize: 18, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  heroTitle: { fontSize: 38, fontWeight: "800", color: colors.textPrimary, letterSpacing: -1.2, lineHeight: 44, marginBottom: 10 },
  heroSub:   { fontSize: 16, color: colors.textSecondary, marginBottom: 20, lineHeight: 23 },
  perks:     { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  perkItem:  { flexDirection: "row", alignItems: "center", backgroundColor: colors.accent + "15", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 5, borderWidth: 1, borderColor: colors.accent + "25" },
  perkText:  { fontSize: 12, color: colors.accent, fontWeight: "600" },

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
  cta:       { marginTop: 8 },
  terms:     { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 16, lineHeight: 18 },
  termsLink: { color: colors.primary, fontWeight: "600" },
  footer:    { flexDirection: "row", justifyContent: "center" },
  footerText: { color: colors.textSecondary, fontSize: 15 },
  footerLink: { color: colors.primary, fontWeight: "700", fontSize: 15 },
});
