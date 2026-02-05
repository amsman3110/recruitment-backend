import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGet } from "../services/api";

export default function RecruiterJobsScreen() {
  const router = useRouter();

  const [stats, setStats] = useState({
    draft: 0,
    open: 0,
    closed: 0,
    total_jobs: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [selectedTab, jobs]);

  async function loadJobs() {
    try {
      setLoading(true);

      // Load stats
      const statsData = await apiGet("/jobs/stats");
      console.log("Job stats:", statsData);
      setStats(statsData);

      // Load all jobs
      const jobsData = await apiGet("/jobs");
      console.log("Jobs loaded:", jobsData.length);
      setJobs(jobsData);

      setLoading(false);
    } catch (error) {
      console.error("Error loading jobs:", error);
      Alert.alert("Error", "Failed to load jobs");
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }

  function filterJobs() {
    if (selectedTab === "all") {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter((job: any) => job.status === selectedTab));
    }
  }

  function handleJobPress(jobId: number) {
    router.push(`/job-detail?id=${jobId}` as any);
  }

  function handlePostJob() {
    router.push("/job-post" as any);
  }

  function handleEditJob(jobId: number) {
    router.push(`/job-post?id=${jobId}` as any);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Job Management</Text>
          <Text style={styles.headerSubtitle}>
            Post and manage your job listings
          </Text>
        </View>
        <Pressable style={styles.postButton} onPress={handlePostJob}>
          <Text style={styles.postButtonText}>+ Post Job</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statNumber}>{stats.total_jobs}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={styles.statNumber}>{stats.open}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardOrange]}>
              <Text style={styles.statNumber}>{stats.draft}</Text>
              <Text style={styles.statLabel}>Draft</Text>
            </View>
            <View style={[styles.statCard, styles.statCardRed]}>
              <Text style={styles.statNumber}>{stats.closed}</Text>
              <Text style={styles.statLabel}>Closed</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tab,
              selectedTab === "all" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "all" && styles.tabTextActive,
              ]}
            >
              All ({jobs.length})
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              selectedTab === "open" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("open")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "open" && styles.tabTextActive,
              ]}
            >
              Open ({stats.open})
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              selectedTab === "draft" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("draft")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "draft" && styles.tabTextActive,
              ]}
            >
              Draft ({stats.draft})
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              selectedTab === "closed" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("closed")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "closed" && styles.tabTextActive,
              ]}
            >
              Closed ({stats.closed})
            </Text>
          </Pressable>
        </View>

        {/* Jobs List */}
        <View style={styles.jobsSection}>
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>
                {selectedTab === "all"
                  ? "No Jobs Yet"
                  : `No ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Jobs`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedTab === "all"
                  ? "Create your first job posting to get started"
                  : `You don't have any ${selectedTab} jobs at the moment`}
              </Text>
              {selectedTab === "all" && (
                <Pressable style={styles.emptyButton} onPress={handlePostJob}>
                  <Text style={styles.emptyButtonText}>+ Post Your First Job</Text>
                </Pressable>
              )}
            </View>
          ) : (
            filteredJobs.map((job: any) => (
              <Pressable
                key={job.id}
                style={styles.jobCard}
                onPress={() => handleJobPress(job.id)}
              >
                <View style={styles.jobHeader}>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={styles.jobMeta}>
                      {job.location && (
                        <Text style={styles.jobMetaText}>📍 {job.location}</Text>
                      )}
                      {job.job_type && (
                        <Text style={styles.jobMetaText}>• {job.job_type}</Text>
                      )}
                      {job.workplace && (
                        <Text style={styles.jobMetaText}>• {job.workplace}</Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      job.status === "open" && styles.statusBadgeOpen,
                      job.status === "draft" && styles.statusBadgeDraft,
                      job.status === "closed" && styles.statusBadgeClosed,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {job.status?.toUpperCase() || "OPEN"}
                    </Text>
                  </View>
                </View>

                {job.description && (
                  <Text
                    style={styles.jobDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {job.description}
                  </Text>
                )}

                <View style={styles.jobFooter}>
                  <View style={styles.jobStats}>
                    <Text style={styles.jobStatsText}>
                      📅 Posted{" "}
                      {new Date(job.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.jobActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditJob(job.id);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️ Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.viewButton}
                      onPress={() => handleJobPress(job.id)}
                    >
                      <Text style={styles.viewButtonText}>View →</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  postButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardBlue: {
    backgroundColor: "#007AFF",
  },
  statCardGreen: {
    backgroundColor: "#34C759",
  },
  statCardOrange: {
    backgroundColor: "#FF9500",
  },
  statCardRed: {
    backgroundColor: "#FF3B30",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  jobsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  jobMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  jobMetaText: {
    fontSize: 13,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeOpen: {
    backgroundColor: "#D1FAE5",
  },
  statusBadgeDraft: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeClosed: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
  },
  jobDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F7",
  },
  jobStats: {
    flex: 1,
  },
  jobStatsText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  jobActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F5F5F7",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});