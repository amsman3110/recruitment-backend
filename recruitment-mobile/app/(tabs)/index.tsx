import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiPost } from "../services/api";

export default function HomeScreen() {
  const router = useRouter();

  /* ===============================
     DEV AUTO LOGIN
  ================================ */
  useEffect(() => {
    async function devLogin() {
      try {
        const existingToken = await AsyncStorage.getItem("token");

        if (existingToken) {
          console.log("✅ Token already exists");
          return;
        }

        console.log("🔐 Logging in (DEV MODE)...");
        const res = await apiPost("/auth/login", {});
        await AsyncStorage.setItem("token", res.token);

        console.log("✅ Token saved");
      } catch (error) {
        console.error("❌ DEV LOGIN FAILED", error);
        Alert.alert("Error", "Dev login failed");
      }
    }

    devLogin();
  }, []);

  /* ===============================
     LOGOUT
  ================================ */
  async function handleLogout() {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <Text style={styles.subtitle}>
        You are logged in (DEV MODE)
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
