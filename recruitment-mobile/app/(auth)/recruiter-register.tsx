import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { apiPost } from "../services/api";

export default function RecruiterRegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    console.log("=== RECRUITER REGISTER START ===");
    console.log("Email:", email);
    console.log("Company:", companyName);

    if (!email || !password || !confirmPassword || !companyName) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending recruiter registration request...");

      const response = await apiPost("/auth/register-recruiter", {
        email: email,
        password: password,
        companyName: companyName,
        industry: industry || null,
      });

      console.log("✅ Recruiter registration successful:", response);

      Alert.alert(
        "Success",
        "Recruiter account created successfully! Please log in.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/recruiter-login" as any);
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Recruiter registration error:", error);

      const message =
        (error && typeof error === "object" && "message" in error && (error as any).message) ||
        "Registration failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  function handleBackToLogin() {
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={handleBackToLogin}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Register as Recruiter</Text>
        <Text style={styles.subtitle}>Create your company account</Text>

        <TextInput
          style={styles.input}
          placeholder="Company Name *"
          placeholderTextColor="#999999"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <TextInput
          style={styles.input}
          placeholder="Industry (e.g., Technology, Finance)"
          placeholderTextColor="#999999"
          value={industry}
          onChangeText={setIndustry}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address *"
          placeholderTextColor="#999999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters) *"
          placeholderTextColor="#999999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          placeholderTextColor="#999999"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={styles.requiredNote}>* Required fields</Text>

        <Pressable
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Register as Recruiter"}
          </Text>
        </Pressable>

        <Pressable onPress={handleBackToLogin}>
          <Text style={styles.loginText}>
            Already have a recruiter account? Login
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#34C759",
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: "#000000",
  },
  requiredNote: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 16,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  loginText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#CCCCCC",
  },
});