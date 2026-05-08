import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";
import { Button } from "@/components/Button";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const styles = getStyles(colors);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || user?.emailAddresses[0].emailAddress.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.fullName || "User"}</Text>
            <Text style={styles.email}>{user?.emailAddresses[0].emailAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name={theme === "dark" ? "moon" : "sunny"} size={18} color={colors.primary} />
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: "#CBD5E1", true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.danger + "15" }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.danger }]}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>FlowLedger v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  profileCard: {
    flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 24, 
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 32,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + "15", alignItems: "center", justifyContent: "center", marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: "800", color: colors.primary },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  email: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, 
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 8,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  footer: { marginTop: "auto", alignItems: "center", paddingVertical: 20 },
  version: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
});
