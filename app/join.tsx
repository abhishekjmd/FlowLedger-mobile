import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/api/client";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/lib/toast";

export default function JoinGroupScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { isSignedIn, isLoaded } = useAuth();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);
  
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInviteInfo();
    }
  }, [token]);

  const fetchInviteInfo = async () => {
    try {
      const response = await apiClient.get(`/expenses/groups/invites/${token}`);
      setInviteInfo(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid invitation link");
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isSignedIn) {
      // Redirect to signup but keep the token
      router.push({ pathname: "/(auth)/signup", params: { inviteToken: token } } as any);
      return;
    }

    setIsJoining(true);
    try {
      await apiClient.post("/expenses/groups/invites/accept", { token });
      toast.success(`Joined ${inviteInfo.group.name}!`);
      router.replace(`/(groups)/${inviteInfo.group.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-open-outline" size={60} color={colors.primary} />
        </View>

        <Text style={styles.invitedText}>You've been invited!</Text>
        <Text style={styles.inviterText}>
          <Text style={{ fontWeight: "700", color: colors.textPrimary }}>{inviteInfo?.inviter?.name}</Text> invited you to join
        </Text>
        
        <View style={styles.groupCard}>
          <View style={styles.groupIcon}>
            <Text style={styles.groupInitial}>{inviteInfo?.group?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.groupName}>{inviteInfo?.group?.name}</Text>
          {inviteInfo?.group?.description && (
            <Text style={styles.groupDesc}>{inviteInfo.group.description}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Button 
            title={isSignedIn ? "Join Group" : "Sign up to Join"} 
            onPress={handleJoin} 
            loading={isJoining}
          />
          {!isSignedIn && (
            <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)/login", params: { inviteToken: token } } as any)}>
              <Text style={styles.loginLink}>Already have an account? <Text style={{ color: colors.primary }}>Log in</Text></Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  header: { padding: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 32, paddingTop: 40 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary + "10", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  invitedText: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
  inviterText: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginBottom: 32 },
  groupCard: { width: "100%", backgroundColor: colors.surface, borderRadius: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: colors.surfaceBorder },
  groupIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  groupInitial: { fontSize: 32, fontWeight: "800", color: "#fff" },
  groupName: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  groupDesc: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
  footer: { width: "100%", marginTop: "auto", marginBottom: 40, gap: 16 },
  loginLink: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
});
