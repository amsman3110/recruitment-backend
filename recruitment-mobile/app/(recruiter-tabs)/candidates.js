// candidates.js - Optimized with memo and deferred loading
import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiGet } from "../services/api";

// Memoize candidate card to prevent re-renders
const CandidateCard = memo(({ candidate, onPress }) => (
  <Pressable style={styles.candidateCard} onPress={() => onPress(candidate.id)}>
    <View style={styles.candidateHeader}>
      <View style={styles.candidateAvatar}>
        <Text style={styles.candidateAvatarText}>
          {candidate.name ? candidate.name.charAt(0).toUpperCase() : "?"}
        </Text>
      </View>
      <View style={styles.candidateInfo}>
        <Text style={styles.candidateName}>{candidate.name || "Anonymous"}</Text>
        {candidate.current_job_title && (
          <Text style={styles.candidateTitle}>{candidate.current_job_title}</Text>
        )}
        {candidate.specialization && (
          <Text style={styles.candidateSpecialization}>{candidate.specialization}</Text>
        )}
      </View>
    </View>
    {candidate.profile_summary && (
      <Text style={styles.candidateSummary} numberOfLines={2}>
        {candidate.profile_summary}
      </Text>
    )}
    {candidate.technical_skills && candidate.technical_skills.length > 0 && (
      <View style={styles.skillsContainer}>
        {candidate.technical_skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {candidate.technical_skills.length > 3 && (
          <Text style={styles.moreSkills}>+{candidate.technical_skills.length - 3} more</Text>
        )}
      </View>
    )}
    <View style={styles.candidateActions}>
      <Text style={styles.viewProfileText}>View Profile →</Text>
    </View>
  </Pressable>
));

export default function CandidatesScreen() {
  const router = useRouter();
  const [searchKeywords, setSearchKeywords] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobTitle: "",
    skills: "",
    location: "",
    experienceMin: "",
    experienceMax: "",
  });

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      setSearched(true);

      const params = new URLSearchParams();
      if (searchKeywords.trim()) params.append("keywords", searchKeywords.trim());
      if (filters.jobTitle.trim()) params.append("keywords", filters.jobTitle.trim());
      if (filters.skills.trim()) params.append("skills", filters.skills.trim());
      if (filters.location.trim()) params.append("location", filters.location.trim());
      if (filters.experienceMin.trim()) params.append("experienceMin", filters.experienceMin.trim());
      if (filters.experienceMax.trim()) params.append("experienceMax", filters.experienceMax.trim());

      const queryString = params.toString();
      const url = "/recruiter/candidates/search" + (queryString ? "?" + queryString : "");
      
      const results = await apiGet(url);
      setCandidates(results.candidates || []);
    } catch (error) {
      console.error("Search error:", error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [searchKeywords, filters]);

  const clearFilters = useCallback(() => {
    setSearchKeywords("");
    setFilters({ jobTitle: "", skills: "", location: "", experienceMin: "", experienceMax: "" });
    setCandidates([]);
    setSearched(false);
  }, []);

  const handleCandidatePress = useCallback((candidateId) => {
    router.push("/candidate-detail?id=" + candidateId);
  }, [router]);

  const hasActiveFilters = 
    searchKeywords.trim() !== "" ||
    filters.jobTitle.trim() !== "" ||
    filters.skills.trim() !== "" ||
    filters.location.trim() !== "" ||
    filters.experienceMin.trim() !== "" ||
    filters.experienceMax.trim() !== "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Candidate Database</Text>
        <Text style={styles.subtitle}>Search and discover talent</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, title, skills..."
          placeholderTextColor="#999"
          value={searchKeywords}
          onChangeText={setSearchKeywords}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <View style={styles.filterBar}>
        <Pressable style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Text style={styles.filterButtonText}>🔍 Filters</Text>
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </Pressable>
        {hasActiveFilters && (
          <Pressable style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>✕ Clear All</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching candidates...</Text>
          </View>
        ) : !searched ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Search Candidates</Text>
            <Text style={styles.emptyText}>Enter keywords or use filters to find candidates</Text>
          </View>
        ) : candidates.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>Try different keywords or adjust filters</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} found
              </Text>
            </View>
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onPress={handleCandidatePress}
              />
            ))}
          </>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Filter Modal - keeping it simple for now */}
      <Modal visible={showFilters} animationType="slide" transparent={true} onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <Pressable onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>×</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Job Title</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g., Software Engineer"
                  value={filters.jobTitle}
                  onChangeText={(text) => setFilters({ ...filters, jobTitle: text })}
                />
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Skills</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g., React, Node.js"
                  value={filters.skills}
                  onChangeText={(text) => setFilters({ ...filters, skills: text })}
                />
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Location</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g., Cairo"
                  value={filters.location}
                  onChangeText={(text) => setFilters({ ...filters, location: text })}
                />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable style={styles.modalButtonSecondary} onPress={() => setShowFilters(false)}>
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButtonPrimary} onPress={() => { setShowFilters(false); handleSearch(); }}>
                <Text style={styles.modalButtonPrimaryText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F7" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  title: { fontSize: 28, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 14, color: "#8E8E93", marginTop: 4 },
  searchContainer: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#fff", gap: 12 },
  searchInput: { flex: 1, backgroundColor: "#F5F5F7", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: "#000" },
  searchButton: { backgroundColor: "#007AFF", paddingHorizontal: 20, borderRadius: 8, justifyContent: "center" },
  searchButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  filterBar: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E5EA", gap: 12 },
  filterButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F7", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, position: "relative" },
  filterButtonText: { fontSize: 15, color: "#000", fontWeight: "500" },
  filterBadge: { position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30" },
  clearButton: { backgroundColor: "#FF3B30", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, justifyContent: "center" },
  clearButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  resultsContainer: { flex: 1 },
  centerContent: { alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 40 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#8E8E93" },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#000", marginBottom: 8 },
  emptyText: { fontSize: 16, color: "#8E8E93", textAlign: "center", lineHeight: 22 },
  resultsHeader: { paddingHorizontal: 20, paddingVertical: 16 },
  resultsCount: { fontSize: 16, fontWeight: "600", color: "#8E8E93" },
  candidateCard: { backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 16 },
  candidateHeader: { flexDirection: "row", marginBottom: 12 },
  candidateAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  candidateAvatarText: { fontSize: 24, fontWeight: "700", color: "#fff" },
  candidateInfo: { flex: 1, justifyContent: "center" },
  candidateName: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 2 },
  candidateTitle: { fontSize: 15, color: "#007AFF", fontWeight: "500", marginBottom: 2 },
  candidateSpecialization: { fontSize: 14, color: "#8E8E93" },
  candidateSummary: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 12 },
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  skillBadge: { backgroundColor: "#E5F4FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  skillText: { fontSize: 13, color: "#007AFF", fontWeight: "500" },
  moreSkills: { fontSize: 13, color: "#8E8E93", alignSelf: "center" },
  candidateActions: { borderTopWidth: 1, borderTopColor: "#F5F5F7", paddingTop: 12 },
  viewProfileText: { fontSize: 15, color: "#007AFF", fontWeight: "600", textAlign: "right" },
  bottomSpacer: { height: 40 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  modalClose: { fontSize: 28, color: "#8E8E93", fontWeight: "300" },
  modalBody: { paddingHorizontal: 20, paddingVertical: 20 },
  filterGroup: { marginBottom: 24 },
  filterLabel: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 8 },
  filterInput: { backgroundColor: "#F5F5F7", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: "#000", borderWidth: 1, borderColor: "#E5E5EA" },
  modalFooter: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#E5E5EA", gap: 12 },
  modalButtonSecondary: { flex: 1, backgroundColor: "#F5F5F7", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  modalButtonSecondaryText: { fontSize: 16, fontWeight: "600", color: "#000" },
  modalButtonPrimary: { flex: 1, backgroundColor: "#007AFF", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  modalButtonPrimaryText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});