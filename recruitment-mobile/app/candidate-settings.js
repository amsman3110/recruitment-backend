import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiPost } from "./services/api";

const COLORS = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceLight: "#2A2A2A",
  primary: "#007AFF",
  text: "#ffffff",
  textSecondary: "#cccccc",
  textMuted: "#888888",
  border: "#3D3D3D",
  error: "#FF3B30",
  success: "#34C759",
};

export default function CandidateSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleChangeEmail() {
    if (!newEmail.trim() || !emailPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!newEmail.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/auth/change-email", {
        newEmail: newEmail.trim(),
        password: emailPassword,
      });

      Alert.alert("Success", "Email changed successfully. Please login again.");
      setNewEmail("");
      setEmailPassword("");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Change email error:", error);
      Alert.alert("Error", error.message || "Failed to change email");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      Alert.alert("Success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Change Email Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Change Email</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>New Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new email"
              placeholderTextColor={COLORS.textMuted}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm with password"
              placeholderTextColor={COLORS.textMuted}
              value={emailPassword}
              onChangeText={setEmailPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleChangeEmail}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Changing..." : "Change Email"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor={COLORS.textMuted}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              editable={!loading}
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor={COLORS.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!loading}
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Changing..." : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
});