import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGroupDetails } from "@/features/expense/hooks/useGroups";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors } from "@/constants/theme";
import { toast } from "@/lib/toast";

export default function InviteMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { group, invite, isInviting } = useGroupDetails(id!);
  const [email, setEmail] = useState("");
  const [inviteResult, setInviteResult] = useState<{ token: string; link: string } | null>(null);

  const handleInvite = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error("Please enter an email address");
      return;
    }

    invite(
      { email: trimmedEmail },
      {
        onSuccess: (response: any) => {
          const data = response.data.data;
          if (data.isNewUser) {
            const token = data.inviteToken;
            const link = `flowledgermobile://join?token=${token}`;
            setInviteResult({ token, link });
            toast.success("Invitation link generated!");
          } else {
            toast.success("Member added to group!");
            setEmail("");
            router.back();
          }
        },
      }
    );
  };

  const handleShare = async () => {
    if (!inviteResult) return;
    try {
      await Share.share({
        message: `Join my group "${group?.name}" on FlowLedger! Click here to join: ${inviteResult.link}`,
        title: "Join FlowLedger Group",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Invite Friends</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.illustrationContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.subtitle}>
              Split expenses seamlessly with anyone. They don't even need to be on FlowLedger yet!
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Invite via Email"
              placeholder="friend@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setInviteResult(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />}
            />
            
            <Button 
              title={inviteResult ? "Link Generated" : "Send Invite"} 
              onPress={handleInvite} 
              loading={isInviting}
              disabled={!!inviteResult}
            />
          </View>

          {inviteResult && (
            <View style={styles.resultContainer}>
              <View style={styles.divider} />
              <Text style={styles.resultTitle}>Share this link with them</Text>
              <View style={styles.linkCard}>
                <Text style={styles.linkText} numberOfLines={1}>{inviteResult.link}</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                  <Ionicons name="share-social" size={20} color="#fff" />
                  <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                Once they sign up using this link (or with this email), they'll be automatically added to the group.
              </Text>
            </View>
          )}

          {!inviteResult && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>
                If your friend is already on FlowLedger, they'll be added instantly. Otherwise, we'll create an invite for them.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  content: {
    padding: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    gap: 8,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.primary + "08",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  resultContainer: {
    marginTop: 32,
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    width: "100%",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  linkCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  shareBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
