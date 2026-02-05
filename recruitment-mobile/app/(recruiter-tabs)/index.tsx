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

export default function RecruiterHomeScreen() {
  const router = useRouter();

  const [stats, setStats] = useState({
    draft: 0,
    open: 0,
    closed: 0,
    total_jobs: 0,
    total_applications: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // Get job statistics
      const statsData = await apiGet("/jobs/stats");
      console.log("Stats:", statsData);
      setStats(statsData);

      // Get recruiter's jobs to show recent applications
      const jobs = await apiGet("/jobs");
      console.log("Jobs:", jobs.length);

      setLoading(false);
    } catch (error) {
      console.error("❌ Dashboard error:", error);
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Recruiter Dashboard</Text>
        <Text style={styles.subtitle}>Manage your recruitment process</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statNumber}>{stats.total_jobs}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statNumber}>{stats.open}</Text>
            <Text style={styles.statLabel}>Open Jobs</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statNumber}>{stats.draft}</Text>
            <Text style={styles.statLabel}>Draft Jobs</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statNumber}>{stats.total_applications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <Pressable
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push("/(recruiter-tabs)/jobs" as any)}
        >
          <Text style={styles.actionButtonIcon}>💼</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Post a New Job</Text>
            <Text style={styles.actionButtonSubtitle}>
              Create and publish job listings
            </Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.actionButtonGreen]}
          onPress={() => router.push("/(recruiter-tabs)/jobs" as any)}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>View Open Jobs</Text>
            <Text style={styles.actionButtonSubtitle}>
              See all active job postings
            </Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => router.push("/(recruiter-tabs)/candidates" as any)}
        >
          <Text style={styles.actionButtonIcon}>👥</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Search Candidates</Text>
            <Text style={styles.actionButtonSubtitle}>
              Browse candidate database
            </Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.actionButtonTertiary]}
          onPress={() => router.push("/(recruiter-tabs)/company-profile" as any)}
        >
          <Text style={styles.actionButtonIcon}>🏢</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Company Profile</Text>
            <Text style={styles.actionButtonSubtitle}>
              Update company information
            </Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </Pressable>
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Getting Started</Text>
        <View style={styles.tipsCard}>
          <Text style={styles.tipItem}>
            ✓ Post your first job to attract candidates
          </Text>
          <Text style={styles.tipItem}>
            ✓ Complete your company profile for better visibility
          </Text>
          <Text style={styles.tipItem}>
            ✓ Search the candidate database to find talent
          </Text>
          <Text style={styles.tipItem}>
            ✓ Use the pipeline to track candidate progress
          </Text>
        </View>
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
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
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
    padding: 20,
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
  statCardPurple: {
    backgroundColor: "#AF52DE",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
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
  actionButtonPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  actionButtonGreen: {
    borderLeftWidth: 4,
    borderLeftColor: "#30D158",
  },
  actionButtonSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  actionButtonTertiary: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  actionButtonArrow: {
    fontSize: 24,
    color: "#8E8E93",
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipItem: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
    lineHeight: 22,
  },
});