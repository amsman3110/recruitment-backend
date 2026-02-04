import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGet } from "../services/api";

export default function HomeScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const profile = await apiGet("/candidate/profile");
      setUserName(profile.name || "User");

      const apps = await apiGet("/applications");
      setApplications(apps);

      const jobs = await apiGet("/jobs");
      setRecommendedJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStatusColor(status) {
    switch (status) {
      case "applied":
        return "#007AFF";
      case "reviewed":
        return "#FF9500";
      case "accepted":
        return "#34C759";
      case "rejected":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  }

  function getStatusText(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{userName}!</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Applications</Text>
          <Text style={styles.sectionCount}>{applications.length}</Text>
        </View>

        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No applications yet</Text>
            <Text style={styles.emptySubtext}>
              Start applying to jobs below!
            </Text>
          </View>
        ) : (
          applications.map((app) => (
            <Pressable
              key={app.id}
              style={styles.applicationCard}
              onPress={() => router.push(`/job-details?id=${app.job_id}`)}
            >
              <View style={styles.applicationHeader}>
                <View style={styles.applicationInfo}>
                  <Text style={styles.jobTitle}>{app.job_title}</Text>
                  {app.job_location && (
                    <Text style={styles.jobLocation}>
                      📍 {app.job_location}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(app.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(app.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.appliedDate}>
                Applied: {formatDate(app.applied_at)}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
        </View>

        {recommendedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyText}>No jobs available</Text>
          </View>
        ) : (
          recommendedJobs.map((job) => (
            <Pressable
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/job-details?id=${job.id}`)}
            >
              <Text style={styles.jobTitle}>{job.title}</Text>
              {job.company_name && (
                <Text style={styles.companyName}>{job.company_name}</Text>
              )}
              <View style={styles.jobMeta}>
                {job.location && (
                  <Text style={styles.jobMetaText}>📍 {job.location}</Text>
                )}
                {job.experience_years !== null && (
                  <Text style={styles.jobMetaText}>
                    💼 {job.experience_years}+ years
                  </Text>
                )}
              </View>
            </Pressable>
          ))
        )}

        <Pressable
          style={styles.viewAllButton}
          onPress={() => router.push("/jobs")}
        >
          <Text style={styles.viewAllText}>View All Jobs →</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 16,
    color: "#8E8E93",
  },
  userName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },
  sectionCount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
  },
  applicationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  applicationInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  appliedDate: {
    fontSize: 13,
    color: "#8E8E93",
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  companyName: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  jobMetaText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8E93",
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
  },
  viewAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});