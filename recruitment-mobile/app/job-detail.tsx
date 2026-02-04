import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGet, apiPost } from "./services/api";

type Job = {
  id: number;
  title: string;
  description: string;
  qualifications: string;
  location: string;
  company_name: string;
  experience_years: number;
  created_at: string;
};

export default function JobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  async function fetchJobDetails() {
    try {
      setLoading(true);
      const data = await apiGet(`/jobs/${jobId}`);
      setJob(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load job details");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!job) return;

    Alert.alert(
      "Apply to Job",
      `Do you want to apply for ${job.title}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Apply",
          onPress: async () => {
            setApplying(true);
            try {
              await apiPost("/applications", { job_id: job.id });
              Alert.alert(
                "Success",
                "Your application has been submitted!",
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to submit application"
              );
            } finally {
              setApplying(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </View>

        {/* Job Title */}
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          {job.company_name && (
            <Text style={styles.companyName}>{job.company_name}</Text>
          )}
        </View>

        {/* Job Meta */}
        <View style={styles.metaSection}>
          {job.location && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
          )}
          {job.experience_years !== null && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>💼</Text>
              <Text style={styles.metaText}>
                {job.experience_years} years experience
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{job.description}</Text>
          </View>
        )}

        {/* Qualifications */}
        {job.qualifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qualifications</Text>
            <Text style={styles.sectionText}>{job.qualifications}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.applyContainer}>
        <Pressable
          onPress={handleApply}
          disabled={applying}
          style={[
            styles.applyButton,
            applying && styles.applyButtonDisabled,
          ]}
        >
          <Text style={styles.applyButtonText}>
            {applying ? "Applying..." : "Apply Now"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    color: "#B00020",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#000",
  },
  companyName: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  metaSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  metaText: {
    fontSize: 15,
    color: "#444",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },
  sectionText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
  },
  applyContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  applyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonDisabled: {
    backgroundColor: "#ccc",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});