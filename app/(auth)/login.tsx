import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Colors } from "@/constants/theme";

const loginSchema = z.object({
  email_username: z.string().min(3, "Email or username required"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, isLoggingIn } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
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
            <Text style={styles.heroSub}>
              Sign in to continue managing your finances
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email_username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email or Username"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email_username?.message}
                  leftIcon={
                    <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPass}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                  }
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      <Ionicons
                        name={showPass ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={Colors.textMuted}
                      />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={handleSubmit((d) => login(d))}
              loading={isLoggingIn}
              style={styles.cta}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don{"\u2019"}t have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Create account</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Trust badges */}
          <View style={styles.trust}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.trustText}>256-bit encrypted · SOC 2 compliant</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  flex:    { flex: 1 },
  scroll:  { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },
  logoWrap: { flexDirection: "row", alignItems: "center", marginBottom: 48 },
  logoBox:  {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    marginRight: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10,
  },
  logoText: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -0.5 },
  hero:     { marginBottom: 36 },
  heroTitle: { fontSize: 34, fontWeight: "800", color: Colors.textPrimary, letterSpacing: -1, marginBottom: 8 },
  heroSub:   { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
  form:      { marginBottom: 24 },
  cta:       { marginTop: 4 },
  footer:    { flexDirection: "row", justifyContent: "center", marginBottom: 24 },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  footerLink: { color: Colors.primary, fontWeight: "700", fontSize: 15 },
  trust:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  trustText: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.3 },
});
