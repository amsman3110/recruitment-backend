import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { apiGet } from "../services/api";

type Job = {
  id: number;
  title: string;
  location: string;
};

function Banner({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: "#FDECEA",
        borderColor: "#F5B7B1",
        borderWidth: 1,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <Text
        style={{
          color: "#B00020",
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

export default function JobsScreen() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet<Job[]>("/jobs");
      setJobs(data);
    } catch {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#555",
          }}
        >
          Loading jobs…
        </Text>
      </View>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          backgroundColor: "white",
        }}
      >
        <Banner text={error} />

        <Pressable
          onPress={fetchJobs}
          style={{
            backgroundColor: "#000",
            padding: 14,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ---------- Empty ---------- */
  if (jobs.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          backgroundColor: "white",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          No jobs yet
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#555",
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          New opportunities will appear here when they become available.
        </Text>

        <Pressable
          onPress={fetchJobs}
          style={{
            backgroundColor: "#000",
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Refresh
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ---------- Success ---------- */
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 30,
        backgroundColor: "white",
      }}
    >
      <View style={{ marginTop: 80 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            marginBottom: 24,
          }}
        >
          Jobs
        </Text>

        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push(`/job-detail?id=${item.id}`)
              }
              style={{
                backgroundColor: "#fff",
                paddingVertical: 20,
                paddingHorizontal: 18,
                borderRadius: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                {item.title}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                }}
              >
                {item.location}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}
