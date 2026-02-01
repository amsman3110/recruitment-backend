import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { apiPost } from "./services/api";

function Banner({
  type,
  text,
}: {
  type: "success" | "error";
  text: string;
}) {
  const isSuccess = type === "success";

  return (
    <View
      style={{
        backgroundColor: isSuccess ? "#E7F7EE" : "#FDECEA",
        borderColor: isSuccess ? "#9ADFB3" : "#F5B7B1",
        borderWidth: 1,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <Text
        style={{
          color: isSuccess ? "#1E7F4F" : "#B00020",
          fontSize: 16,
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function applyToJob() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<{ message: string }>(
        `/jobs/${id}/apply`,
        {}
      );

      setApplied(true);
      setMessage(response.message);
    } catch {
      setError("Failed to apply for this job. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 30,
      }}
    >
      <View style={{ marginTop: 80 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            marginBottom: 10,
          }}
        >
          Job Detail
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#555",
            marginBottom: 30,
          }}
        >
          Job ID: {id}
        </Text>

        {loading && <ActivityIndicator size="large" />}

        {message && <Banner type="success" text={message} />}
        {error && <Banner type="error" text={error} />}

        <Pressable
          onPress={applyToJob}
          disabled={loading || applied}
          style={{
            backgroundColor: applied ? "#e5e5e5" : "#000",
            padding: 16,
            borderRadius: 12,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              color: applied ? "#666" : "white",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {applied ? "Applied" : "Apply for this Job"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
