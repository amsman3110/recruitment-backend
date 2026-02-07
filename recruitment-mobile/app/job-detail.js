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

export default function JobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, []);

  async function loadJobDetails() {
    try {
      setLoading(true);
      console.log("📥 Loading job details for ID:", jobId);

      const jobData = await apiGet(`/jobs/${jobId}`);
      console.log("✅ Job loaded:", jobData);
      setJob(jobData);

      try {
        const myApplications = await apiGet("/applications");
        const applied = myApplications.some(
          (app) => app.job_id === parseInt(jobId)
        );
        setHasApplied(applied);
      } catch (err) {
        console.log("Could not check applications:", err);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading job details:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to load job details. Please try again."
      );
      setLoading(false);
    }
  }

  async function handleApply() {
    if (hasApplied) {
      Alert.alert("Already Applied", "You have already applied to this job.");
      return;
    }

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
            try {
              setApplying(true);
              console.log("📤 Applying to job:", jobId);

              await apiPost("/applications", {
                job_id: parseInt(jobId),
              });

              console.log("✅ Application submitted!");
              Alert.alert(
                "Success",
                "Your application has been submitted successfully!"
              );
              setHasApplied(true);
            } catch (error) {
              console.error("❌ Error applying:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to submit application. Please try again."
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>{job.title}</Text>

          {job.company_name && (
            <Text style={styles.companyName}>🏢 {job.company_name}</Text>
          )}

          <View style={styles.jobMeta}>
            {job.location && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>📍 {job.location}</Text>
              </View>
            )}
            {job.workplace && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>💼 {job.workplace}</Text>
              </View>
            )}
            {job.job_type && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>⏰ {job.job_type}</Text>
              </View>
            )}
            {job.experience_years !== null &&
              job.experience_years !== undefined && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaText}>
                    🎯 {job.experience_years}+ years
                  </Text>
                </View>
              )}
            {job.career_level && (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>📊 {job.career_level}</Text>
              </View>
            )}
          </View>

          {job.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Job Description</Text>
              <Text style={styles.descriptionText}>{job.description}</Text>
            </View>
          )}

          {job.qualifications && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Requirements</Text>
              <Text style={styles.descriptionText}>{job.qualifications}</Text>
            </View>
          )}

          {job.city && job.country && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Location</Text>
              <Text style={styles.descriptionText}>
                {job.city}, {job.country}
              </Text>
            </View>
          )}

          {job.job_category && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ Category</Text>
              <Text style={styles.descriptionText}>{job.job_category}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.applyContainer}>
        {hasApplied ? (
          <View style={styles.appliedButton}>
            <Text style={styles.appliedButtonText}>✓ Already Applied</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.applyButton, applying && styles.applyButtonDisabled]}
            onPress={handleApply}
            disabled={applying}
          >
            <Text style={styles.applyButtonText}>
              {applying ? "Applying..." : "Apply Now"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    lineHeight: 36,
  },
  companyName: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 16,
  },
  jobMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  metaItem: {
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  applyContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonDisabled: {
    backgroundColor: "#8E8E93",
    opacity: 0.6,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  appliedButton: {
    backgroundColor: "#E5E5EA",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  appliedButtonText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "700",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});