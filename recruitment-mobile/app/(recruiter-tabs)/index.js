import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { apiGet } from "../services/api";

// Memoize static components
const Header = memo(() => (
  <View style={styles.header}>
    <Text style={styles.greeting}>Recruiter Dashboard</Text>
    <Text style={styles.subtitle}>Manage your recruitment process</Text>
  </View>
));

const StatCard = memo(({ number, label, colorStyle }) => (
  <View style={[styles.statCard, colorStyle]}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));

const ActionButton = memo(({ icon, title, subtitle, onPress, borderColor }) => (
  <Pressable
    style={[styles.actionButton, { borderLeftColor: borderColor }]}
    onPress={onPress}
  >
    <Text style={styles.actionButtonIcon}>{icon}</Text>
    <View style={styles.actionButtonContent}>
      <Text style={styles.actionButtonTitle}>{title}</Text>
      <Text style={styles.actionButtonSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.actionButtonArrow}>→</Text>
  </Pressable>
));

const TipsCard = memo(() => (
  <View style={styles.tipsCard}>
    <Text style={styles.tipItem}>✓ Post your first job to attract candidates</Text>
    <Text style={styles.tipItem}>✓ Complete your company profile for better visibility</Text>
    <Text style={styles.tipItem}>✓ Search the candidate database to find talent</Text>
    <Text style={styles.tipItem}>✓ Use the pipeline to track candidate progress</Text>
  </View>
));

export default function RecruiterHomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ total_jobs: 0, open: 0, draft: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  
  useFocusEffect(
  useCallback(() => {
    loadDashboard();
  }, [])
);

  async function loadDashboard() {
    try {
      const jobs = await apiGet("/jobs?limit=5");
      setStats({
        total_jobs: jobs.length,
        open: jobs.filter(j => j.status === 'open').length,
        draft: jobs.filter(j => j.status === 'draft').length,
        closed: jobs.filter(j => j.status === 'closed').length,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  // Show UI immediately, load data in background
  return (
    <ScrollView style={styles.container}>
      <Header />

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard number={loading ? "..." : stats.total_jobs} label="Recent Jobs" colorStyle={styles.statCardBlue} />
          <StatCard number={loading ? "..." : stats.open} label="Open Jobs" colorStyle={styles.statCardGreen} />
        </View>
        <View style={styles.statsRow}>
          <StatCard number={loading ? "..." : stats.draft} label="Draft Jobs" colorStyle={styles.statCardOrange} />
          <StatCard number={loading ? "..." : stats.closed} label="Closed Jobs" colorStyle={styles.statCardPurple} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ActionButton
          icon="💼"
          title="Post a New Job"
          subtitle="Create and publish job listings"
          onPress={() => router.push("/(recruiter-tabs)/jobs")}
          borderColor="#34C759"
        />
        <ActionButton
          icon="📋"
          title="View All Jobs"
          subtitle="See all your job postings"
          onPress={() => router.push("/(recruiter-tabs)/jobs")}
          borderColor="#30D158"
        />
        <ActionButton
          icon="👥"
          title="Search Candidates"
          subtitle="Browse candidate database"
          onPress={() => router.push("/(recruiter-tabs)/candidates")}
          borderColor="#007AFF"
        />
        <ActionButton
          icon="🏢"
          title="Company Profile"
          subtitle="Update company information"
          onPress={() => router.push("/(recruiter-tabs)/company-profile")}
          borderColor="#FF9500"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Getting Started</Text>
        <TipsCard />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F7" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, backgroundColor: "#fff" },
  greeting: { fontSize: 32, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 16, color: "#8E8E93", marginTop: 4 },
  statsContainer: { paddingHorizontal: 20, paddingTop: 20 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 20, alignItems: "center" },
  statCardBlue: { backgroundColor: "#007AFF" },
  statCardGreen: { backgroundColor: "#34C759" },
  statCardOrange: { backgroundColor: "#FF9500" },
  statCardPurple: { backgroundColor: "#AF52DE" },
  statNumber: { fontSize: 36, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#000", marginBottom: 16 },
  actionButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  actionButtonIcon: { fontSize: 32, marginRight: 16 },
  actionButtonContent: { flex: 1 },
  actionButtonTitle: { fontSize: 18, fontWeight: "600", color: "#000", marginBottom: 2 },
  actionButtonSubtitle: { fontSize: 14, color: "#8E8E93" },
  actionButtonArrow: { fontSize: 24, color: "#8E8E93" },
  tipsCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  tipItem: { fontSize: 15, color: "#333", marginBottom: 12, lineHeight: 22 },
  bottomSpacer: { height: 40 },
});