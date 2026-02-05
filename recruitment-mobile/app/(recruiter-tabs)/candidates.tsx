import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiGet } from "../services/api";

export default function CandidatesSearchScreen() {
  const router = useRouter();

  const [searchKeywords, setSearchKeywords] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    try {
      setLoading(true);
      console.log("Searching candidates with keywords:", searchKeywords);

      const queryParams = searchKeywords
        ? `?keywords=${encodeURIComponent(searchKeywords)}`
        : "";
      
      const data = await apiGet(`/recruiter/candidates/search${queryParams}`);
      console.log("Search results:", data.count);

      setCandidates(data.candidates || []);
      setSearched(true);
      setLoading(false);
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert("Error", error.message || "Failed to search candidates");
      setLoading(false);
    }
  }

  function handleCandidatePress(candidateId: number) {
    // Navigate to candidate detail screen
    router.push(`/candidate-detail?id=${candidateId}` as any);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Candidate Database</Text>
        <Text style={styles.headerSubtitle}>Search and discover talent</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, title, skills, or keywords..."
          placeholderTextColor="#999"
          value={searchKeywords}
          onChangeText={setSearchKeywords}
          onSubmitEditing={handleSearch}
        />
        <Pressable
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? "Searching..." : "🔍 Search"}
          </Text>
        </Pressable>
      </View>

      {/* Results */}
      <ScrollView style={styles.resultsContainer}>
        {!searched && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Search Candidates</Text>
            <Text style={styles.emptySubtitle}>
              Enter keywords to find candidates by name, job title, skills, or
              specialization
            </Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34C759" />
            <Text style={styles.loadingText}>Searching candidates...</Text>
          </View>
        )}

        {searched && !loading && candidates.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>😔</Text>
            <Text style={styles.emptyTitle}>No Candidates Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search keywords
            </Text>
          </View>
        )}

        {searched && !loading && candidates.length > 0 && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} found
              </Text>
            </View>

            {candidates.map((candidate: any) => (
              <Pressable
                key={candidate.id}
                style={styles.candidateCard}
                onPress={() => handleCandidatePress(candidate.id)}
              >
                <View style={styles.candidateHeader}>
                  <View style={styles.candidateAvatar}>
                    <Text style={styles.candidateAvatarText}>
                      {candidate.name?.charAt(0) || "C"}
                    </Text>
                  </View>
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candidateName}>
                      {candidate.name || "No Name"}
                    </Text>
                    <Text style={styles.candidateTitle}>
                      {candidate.current_job_title || "No Job Title"}
                    </Text>
                    {candidate.specialization && (
                      <Text style={styles.candidateSpecialization}>
                        {candidate.specialization}
                      </Text>
                    )}
                  </View>
                </View>

                {candidate.profile_summary && (
                  <Text
                    style={styles.candidateSummary}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {candidate.profile_summary}
                  </Text>
                )}

                {candidate.technical_skills &&
                  candidate.technical_skills.length > 0 && (
                    <View style={styles.skillsPreview}>
                      {candidate.technical_skills.slice(0, 3).map((skill: string, index: number) => (
                        <View key={index} style={styles.skillChip}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                      {candidate.technical_skills.length > 3 && (
                        <View style={styles.skillChip}>
                          <Text style={styles.skillText}>
                            +{candidate.technical_skills.length - 3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                <View style={styles.candidateFooter}>
                  <Text style={styles.viewProfileText}>View Profile →</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

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
  header: {
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
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  searchSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  searchInput: {
    backgroundColor: "#F5F5F7",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#000",
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: "#34C759",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  candidateCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  candidateHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  candidateAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  candidateAvatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  candidateInfo: {
    flex: 1,
    justifyContent: "center",
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  candidateTitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 2,
  },
  candidateSpecialization: {
    fontSize: 13,
    color: "#8E8E93",
  },
  candidateSummary: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  skillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  candidateFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F7",
  },
  viewProfileText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },
});