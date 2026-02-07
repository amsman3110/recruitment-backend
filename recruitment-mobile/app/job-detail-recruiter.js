import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
  const [applications, setApplications] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("applications");

  // Modal for moving candidates
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedStage, setSelectedStage] = useState("");

  const PIPELINE_STAGES = [
    { value: "applied", label: "Applied", color: "#007AFF" },
    { value: "shortlisted", label: "Shortlisted", color: "#34C759" },
    { value: "interview_scheduled", label: "Interview Scheduled", color: "#5856D6" },
    { value: "interviewing", label: "Interviewing", color: "#AF52DE" },
    { value: "job_offer", label: "Job Offer", color: "#FFD60A" },
    { value: "on_hold", label: "On Hold", color: "#FF9500" },
    { value: "rejected", label: "Rejected", color: "#FF3B30" },
    { value: "hired", label: "Hired", color: "#30D158" },
  ];

  useEffect(() => {
    loadJobDetails();
  }, []);

  async function loadJobDetails() {
    try {
      setLoading(true);
      console.log("📥 Loading job details for job ID:", jobId);

      // Load job details
      const jobData = await apiGet(`/jobs/${jobId}`);
      console.log("✅ Job loaded:", jobData);
      setJob(jobData);

      // Load applications with error handling
      try {
        const appsData = await apiGet(`/jobs/${jobId}/applications`);
        console.log("✅ Applications loaded:", appsData.length);
        setApplications(appsData);
      } catch (appError) {
        console.error("⚠️ Could not load applications:", appError);
        setApplications([]);
      }

      // Load pipeline with error handling
      try {
        const pipelineData = await apiGet(`/pipeline/${jobId}`);
        console.log("✅ Pipeline loaded:", pipelineData);
        setPipeline(pipelineData);
      } catch (pipeError) {
        console.error("⚠️ Could not load pipeline:", pipeError);
        setPipeline({});
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading job details:", error);
      Alert.alert("Error", "Failed to load job details: " + (error.message || "Unknown error"));
      setLoading(false);
    }
  }

  async function handleMoveCandidate() {
    if (!selectedCandidate || !selectedStage) {
      Alert.alert("Error", "Please select a stage");
      return;
    }

    try {
      await apiPost("/pipeline/move", {
        candidate_id: selectedCandidate.candidate_id,
        job_id: parseInt(jobId),
        stage: selectedStage,
      });

      Alert.alert("Success", "Candidate moved successfully");
      setMoveModalVisible(false);
      setSelectedCandidate(null);
      setSelectedStage("");
      
      // Reload data
      loadJobDetails();
    } catch (error) {
      console.error("Error moving candidate:", error);
      Alert.alert("Error", error.message || "Failed to move candidate");
    }
  }

  function openMoveModal(candidate, currentStage) {
    setSelectedCandidate(candidate);
    setSelectedStage(currentStage || "shortlisted");
    setMoveModalVisible(true);
  }

  function handleViewCandidate(candidateId) {
    router.push(`/candidate-detail?id=${candidateId}`);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Job Details - Recruiter</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Job Info Card */}
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
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

          <View style={styles.jobMeta}>
            {job.location && (
              <Text style={styles.jobMetaText}>📍 {job.location}</Text>
            )}
            {job.job_type && (
              <Text style={styles.jobMetaText}>💼 {job.job_type}</Text>
            )}
            {job.workplace && (
              <Text style={styles.jobMetaText}>🏢 {job.workplace}</Text>
            )}
            {job.experience_years && (
              <Text style={styles.jobMetaText}>
                ⏱️ {job.experience_years}+ years
              </Text>
            )}
          </View>

          {job.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{job.description}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tab,
              selectedTab === "applications" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("applications")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "applications" && styles.tabTextActive,
              ]}
            >
              Applications ({applications.length})
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              selectedTab === "pipeline" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("pipeline")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "pipeline" && styles.tabTextActive,
              ]}
            >
              Pipeline
            </Text>
          </Pressable>
        </View>

        {/* Applications Tab */}
        {selectedTab === "applications" && (
          <View style={styles.section}>
            {applications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  No applications yet
                </Text>
              </View>
            ) : (
              applications.map((app) => (
                <Pressable
                  key={app.application_id}
                  style={styles.applicationCard}
                  onPress={() => handleViewCandidate(app.candidate_id)}
                >
                  <View style={styles.candidateHeader}>
                    <View style={styles.candidateAvatar}>
                      <Text style={styles.candidateAvatarText}>
                        {app.candidate_name?.charAt(0) || "C"}
                      </Text>
                    </View>
                    <View style={styles.candidateInfo}>
                      <Text style={styles.candidateName}>
                        {app.candidate_name || "No Name"}
                      </Text>
                      <Text style={styles.candidateTitle}>
                        {app.current_job_title || "No Title"}
                      </Text>
                      <Text style={styles.candidateEmail}>
                        {app.candidate_email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.applicationFooter}>
                    <Text style={styles.appliedDate}>
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </Text>
                    <Pressable
                      style={styles.addToPipelineButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        openMoveModal({
                          candidate_id: app.candidate_id,
                          candidate_name: app.candidate_name,
                        });
                      }}
                    >
                      <Text style={styles.addToPipelineText}>
                        Add to Pipeline
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Pipeline Tab */}
        {selectedTab === "pipeline" && (
          <View style={styles.section}>
            {PIPELINE_STAGES.map((stage) => {
              const candidates = pipeline[stage.value] || [];
              if (candidates.length === 0) return null;

              return (
                <View key={stage.value} style={styles.pipelineStage}>
                  <View
                    style={[
                      styles.stageHeader,
                      { backgroundColor: stage.color },
                    ]}
                  >
                    <Text style={styles.stageTitle}>
                      {stage.label} ({candidates.length})
                    </Text>
                  </View>

                  {candidates.map((candidate) => (
                    <Pressable
                      key={candidate.pipeline_id}
                      style={styles.pipelineCard}
                      onPress={() => handleViewCandidate(candidate.candidate_id)}
                    >
                      <View style={styles.candidateHeader}>
                        <View style={styles.candidateAvatar}>
                          <Text style={styles.candidateAvatarText}>
                            {candidate.candidate_name?.charAt(0) || "C"}
                          </Text>
                        </View>
                        <View style={styles.candidateInfo}>
                          <Text style={styles.candidateName}>
                            {candidate.candidate_name || "No Name"}
                          </Text>
                          <Text style={styles.candidateTitle}>
                            {candidate.current_job_title || "No Title"}
                          </Text>
                        </View>
                      </View>

                      {candidate.notes && (
                        <Text style={styles.candidateNotes}>
                          📝 {candidate.notes}
                        </Text>
                      )}

                      <View style={styles.pipelineActions}>
                        <Text style={styles.movedDate}>
                          Updated: {new Date(candidate.moved_at).toLocaleDateString()}
                        </Text>
                        <Pressable
                          style={styles.moveButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            openMoveModal(candidate, stage.value);
                          }}
                        >
                          <Text style={styles.moveButtonText}>Move</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}
                </View>
              );
            })}

            {Object.values(pipeline).every((arr) => arr.length === 0) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔄</Text>
                <Text style={styles.emptyText}>
                  No candidates in pipeline yet
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Move Candidate Modal */}
      <Modal
        visible={moveModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move Candidate</Text>

            {selectedCandidate && (
              <View style={styles.selectedCandidateInfo}>
                <Text style={styles.selectedCandidateName}>
                  {selectedCandidate.candidate_name}
                </Text>
              </View>
            )}

            <Text style={styles.modalLabel}>Select Pipeline Stage:</Text>
            <ScrollView style={styles.stagesList}>
              {PIPELINE_STAGES.map((stage) => (
                <Pressable
                  key={stage.value}
                  style={[
                    styles.stageItem,
                    selectedStage === stage.value && styles.stageItemSelected,
                  ]}
                  onPress={() => setSelectedStage(stage.value)}
                >
                  <View
                    style={[
                      styles.stageIndicator,
                      { backgroundColor: stage.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.stageItemText,
                      selectedStage === stage.value &&
                        styles.stageItemTextSelected,
                    ]}
                  >
                    {stage.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setMoveModalVisible(false);
                  setSelectedCandidate(null);
                  setSelectedStage("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleMoveCandidate}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  Move Candidate
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 20,
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
  backButtonText: {
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
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginRight: 12,
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
  jobMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  jobMetaText: {
    fontSize: 14,
    color: "#666",
  },
  descriptionSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F7",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  section: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
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
  candidateHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  candidateAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  candidateInfo: {
    flex: 1,
    justifyContent: "center",
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  candidateTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  candidateEmail: {
    fontSize: 12,
    color: "#8E8E93",
  },
  candidateNotes: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  applicationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F7",
  },
  appliedDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  addToPipelineButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addToPipelineText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  pipelineStage: {
    marginBottom: 20,
  },
  stageHeader: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  pipelineCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pipelineActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F7",
  },
  movedDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  moveButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  moveButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  selectedCandidateInfo: {
    backgroundColor: "#F5F5F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedCandidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  stagesList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  stageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    marginBottom: 8,
  },
  stageItemSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FF",
  },
  stageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stageItemText: {
    fontSize: 15,
    color: "#666",
  },
  stageItemTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#E5E5EA",
  },
  modalButtonPrimary: {
    backgroundColor: "#34C759",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});