import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LoginTypeSelector() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Recruitment</Text>
        <Text style={styles.subtitle}>Choose how you'd like to continue</Text>

        <View style={styles.buttonContainer}>
          {/* Candidate Login */}
          <Pressable
            style={[styles.button, styles.candidateButton]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonTitle}>I'm a Candidate</Text>
            <Text style={styles.buttonSubtitle}>
              Looking for jobs and opportunities
            </Text>
          </Pressable>

          {/* Recruiter Login */}
          <Pressable
            style={[styles.button, styles.recruiterButton]}
            onPress={() => router.push("/recruiter-login" as any)}
          >
            <Text style={styles.buttonIcon}>🏢</Text>
            <Text style={styles.buttonTitle}>I'm a Recruiter</Text>
            <Text style={styles.buttonSubtitle}>
              Posting jobs and hiring talent
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2A",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    textAlign: "center",
    marginBottom: 48,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  candidateButton: {
    backgroundColor: "#007AFF",
  },
  recruiterButton: {
    backgroundColor: "#34C759",
  },
  buttonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});