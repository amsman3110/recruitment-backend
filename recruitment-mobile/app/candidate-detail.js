// @ts-nocheck
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiGet, apiPost } from "./services/api";

export default function CandidateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const rawCandidateId = params.id;
  const candidateId = Array.isArray(rawCandidateId) ? rawCandidateId[0] : rawCandidateId;
  
  const rawJobId = params.jobId;
  const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [pipelineStage, setPipelineStage] = useState("shortlisted");

  const PIPELINE_STAGES = [
    { value: "applied", label: "Applied" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview_scheduled", label: "Interview Scheduled" },
    { value: "interviewing", label: "Interviewing" },
    { value: "job_offer", label: "Job Offer" },
    { value: "on_hold", label: "On Hold" },
  ];

  useEffect(() => {
    loadCandidate();
    loadJobs();
  }, []);

  function loadCandidate() {
    setLoading(true);
    apiGet("/recruiter/candidates/" + String(candidateId))
      .then((data) => {
        console.log("Candidate data:", data);
        setCandidate(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading candidate:", error);
        Alert.alert("Error", "Failed to load candidate profile");
        setLoading(false);
      });
  }

  function loadJobs() {
    apiGet("/jobs?status=open")
      .then((data) => {
        console.log("Jobs:", data.length);
        setJobs(data);
      })
      .catch((error) => {
        console.error("Error loading jobs:", error);
      });
  }

  function handleDownloadCV() {
    setDownloading(true);
    apiGet("/recruiter/candidates/" + String(candidateId) + "/cv")
      .then((response) => {
        if (!response || !response.cv_base64) {
          Alert.alert("Error", "CV not available");
          setDownloading(false);
          return Promise.reject(new Error("No CV"));
        }

        let base64Data = response.cv_base64;
        if (base64Data.indexOf("data:application/pdf;base64,") === 0) {
          base64Data = base64Data.replace("data:application/pdf;base64,", "");
        }

        const candidateName = candidate && candidate.name ? candidate.name : "Candidate";
        const filename = response.filename || candidateName + "_CV.pdf";
        const fileUri = FileSystem.documentDirectory + filename;

        return FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: 'base64',
        }).then(() => {
          console.log("CV saved to:", fileUri);
          return Sharing.isAvailableAsync();
        }).then((canShare) => {
          if (canShare) {
            return Sharing.shareAsync(fileUri);
          } else {
            Alert.alert("Success", "CV downloaded successfully");
            return Promise.resolve();
          }
        });
      })
      .then(() => {
        setDownloading(false);
      })
      .catch((error) => {
        console.error("Error downloading CV:", error);
        Alert.alert("Error", "Failed to download CV");
        setDownloading(false);
      });
  }

  function handleSendInvitation() {
    if (!selectedJob) {
      Alert.alert("Error", "Please select a job");
      return;
    }

    const selectedJobId = selectedJob.id;
    apiPost("/invitations/send", {
      candidate_id: parseInt(String(candidateId)),
      job_id: selectedJobId,
      message: inviteMessage,
    })
      .then(() => {
        Alert.alert("Success", "Invitation sent successfully");
        setInviteModalVisible(false);
        setSelectedJob(null);
        setInviteMessage("");
      })
      .catch((error) => {
        console.error("Error sending invitation:", error);
        const errorMsg = error && error.message ? error.message : "Failed to send invitation";
        Alert.alert("Error", errorMsg);
      });
  }

  function handleAddToPipeline() {
    // If we came from a job detail page, use that jobId directly
    if (jobId) {
      apiPost("/pipeline/add", {
        candidate_id: parseInt(String(candidateId)),
        job_id: parseInt(jobId),
        stage: pipelineStage,
      })
        .then(() => {
          Alert.alert("Success", "Candidate added to pipeline");
          setPipelineModalVisible(false);
          setPipelineStage("shortlisted");
        })
        .catch((error) => {
          console.error("Error adding to pipeline:", error);
          const errorMsg = error && error.message ? error.message : "Failed to add to pipeline";
          Alert.alert("Error", errorMsg);
        });
      return;
    }

    // Otherwise, require job selection
    if (!selectedJob) {
      Alert.alert("Error", "Please select a job");
      return;
    }

    const selectedJobId = selectedJob.id;
    apiPost("/pipeline/add", {
      candidate_id: parseInt(String(candidateId)),
      job_id: selectedJobId,
      stage: pipelineStage,
    })
      .then(() => {
        Alert.alert("Success", "Candidate added to pipeline");
        setPipelineModalVisible(false);
        setSelectedJob(null);
        setPipelineStage("shortlisted");
      })
      .catch((error) => {
        console.error("Error adding to pipeline:", error);
        const errorMsg = error && error.message ? error.message : "Failed to add to pipeline";
        Alert.alert("Error", errorMsg);
      });
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading candidate profile...</Text>
      </View>
    );
  }

  if (!candidate) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Candidate not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const candidateNameInitial = candidate.name && candidate.name.length > 0 ? candidate.name.charAt(0) : "C";
  const candidateNameDisplay = candidate.name || "No Name";
  const candidateJobTitle = candidate.current_job_title || "No Job Title";
  const candidateEmail = candidate.email || "";

  const hasSpecialization = Boolean(candidate.specialization);
  const hasSummary = Boolean(candidate.profile_summary);
  const hasTechnicalSkills = Boolean(candidate.technical_skills && candidate.technical_skills.length > 0);
  const hasSoftSkills = Boolean(candidate.soft_skills && candidate.soft_skills.length > 0);
  const hasExperience = Boolean(candidate.experience);
  const hasEducation = Boolean(candidate.education);
  const hasCourses = Boolean(candidate.courses);
  const hasCertificates = Boolean(candidate.certificates);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Candidate Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{candidateNameInitial}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{candidateNameDisplay}</Text>
              <Text style={styles.jobTitle}>{candidateJobTitle}</Text>
              <Text style={styles.email}>{candidateEmail}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={handleDownloadCV}
              disabled={downloading}
            >
              <Text style={styles.actionButtonText}>
                {downloading ? "Downloading..." : "Download CV"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => setInviteModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Invite to Job</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.actionButtonTertiary]}
              onPress={() => setPipelineModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Add to Pipeline</Text>
            </Pressable>
          </View>
        </View>

        {hasSpecialization ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialization</Text>
            <Text style={styles.sectionContent}>{candidate.specialization}</Text>
          </View>
        ) : null}

        {hasSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.sectionContent}>{candidate.profile_summary}</Text>
          </View>
        ) : null}

        {hasTechnicalSkills ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.skillsContainer}>
              {candidate.technical_skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {hasSoftSkills ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Soft Skills</Text>
            <View style={styles.skillsContainer}>
              {candidate.soft_skills.map((skill, index) => (
                <View key={index} style={[styles.skillChip, styles.softSkillChip]}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {hasExperience ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.sectionContent}>{candidate.experience}</Text>
          </View>
        ) : null}

        {hasEducation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <Text style={styles.sectionContent}>{candidate.education}</Text>
          </View>
        ) : null}

        {hasCourses ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Courses</Text>
            <Text style={styles.sectionContent}>{candidate.courses}</Text>
          </View>
        ) : null}

        {hasCertificates ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificates</Text>
            <Text style={styles.sectionContent}>{candidate.certificates}</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite to Job</Text>

            <Text style={styles.modalLabel}>Select Job:</Text>
            <ScrollView style={styles.jobsList}>
              {jobs.map((job) => {
                const isSelected = Boolean(selectedJob && selectedJob.id === job.id);
                const jobTitle = job.title || "No Title";
                const jobLocation = job.location || "No Location";
                
                return (
                  <Pressable
                    key={job.id}
                    style={isSelected ? [styles.jobItem, styles.jobItemSelected] : styles.jobItem}
                    onPress={() => setSelectedJob(job)}
                  >
                    <Text style={styles.jobItemTitle}>{jobTitle}</Text>
                    <Text style={styles.jobItemLocation}>{jobLocation}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.modalLabel}>Message (Optional):</Text>
            <TextInput
              style={styles.modalTextArea}
              placeholder="Add a personal message..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={inviteMessage}
              onChangeText={setInviteMessage}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setInviteModalVisible(false);
                  setSelectedJob(null);
                  setInviteMessage("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSendInvitation}
              >
                <Text style={styles.modalButtonTextPrimary}>Send Invitation</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={pipelineModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPipelineModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Pipeline</Text>

            {!jobId && (
              <>
                <Text style={styles.modalLabel}>Select Job:</Text>
                <ScrollView style={styles.jobsList}>
                  {jobs.map((job) => {
                    const isSelected = Boolean(selectedJob && selectedJob.id === job.id);
                    const jobTitle = job.title || "No Title";
                    const jobLocation = job.location || "No Location";
                    
                    return (
                      <Pressable
                        key={job.id}
                        style={isSelected ? [styles.jobItem, styles.jobItemSelected] : styles.jobItem}
                        onPress={() => setSelectedJob(job)}
                      >
                        <Text style={styles.jobItemTitle}>{jobTitle}</Text>
                        <Text style={styles.jobItemLocation}>{jobLocation}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <Text style={styles.modalLabel}>Pipeline Stage:</Text>
            <View style={styles.stagesList}>
              {PIPELINE_STAGES.map((stage) => {
                const isSelected = pipelineStage === stage.value;
                
                return (
                  <Pressable
                    key={stage.value}
                    style={isSelected ? [styles.stageItem, styles.stageItemSelected] : styles.stageItem}
                    onPress={() => setPipelineStage(stage.value)}
                  >
                    <Text style={isSelected ? [styles.stageItemText, styles.stageItemTextSelected] : styles.stageItemText}>
                      {stage.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setPipelineModalVisible(false);
                  setSelectedJob(null);
                  setPipelineStage("shortlisted");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddToPipeline}
              >
                <Text style={styles.modalButtonTextPrimary}>Add to Pipeline</Text>
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
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F7" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#8E8E93" },
  errorText: { fontSize: 18, color: "#FF3B30", marginBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  headerSpacer: { width: 60 },
  backButtonText: { fontSize: 16, color: "#007AFF", fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
  content: { flex: 1 },
  profileCard: { backgroundColor: "#fff", padding: 20, marginBottom: 12 },
  profileHeader: { flexDirection: "row", marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", marginRight: 16 },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#fff" },
  profileInfo: { flex: 1, justifyContent: "center" },
  name: { fontSize: 24, fontWeight: "700", color: "#000", marginBottom: 4 },
  jobTitle: { fontSize: 16, color: "#666", marginBottom: 4 },
  email: { fontSize: 14, color: "#8E8E93" },
  actionButtons: { gap: 12 },
  actionButton: { padding: 14, borderRadius: 8, alignItems: "center" },
  actionButtonPrimary: { backgroundColor: "#34C759" },
  actionButtonSecondary: { backgroundColor: "#007AFF" },
  actionButtonTertiary: { backgroundColor: "#FF9500" },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  section: { backgroundColor: "#fff", padding: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 12 },
  sectionContent: { fontSize: 15, color: "#333", lineHeight: 22 },
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { backgroundColor: "#007AFF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  softSkillChip: { backgroundColor: "#34C759" },
  skillText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  bottomSpacer: { height: 40 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxHeight: "80%" },
  modalTitle: { fontSize: 24, fontWeight: "700", color: "#000", marginBottom: 20 },
  modalLabel: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 8, marginTop: 12 },
  jobsList: { maxHeight: 200, marginBottom: 16 },
  jobItem: { padding: 12, borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 8, marginBottom: 8 },
  jobItemSelected: { borderColor: "#34C759", backgroundColor: "#F0FFF4" },
  jobItemTitle: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 4 },
  jobItemLocation: { fontSize: 14, color: "#666" },
  modalTextArea: { borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 8, padding: 12, fontSize: 15, color: "#000", minHeight: 100, textAlignVertical: "top" },
  stagesList: { marginBottom: 20 },
  stageItem: { padding: 12, borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 8, marginBottom: 8 },
  stageItemSelected: { borderColor: "#34C759", backgroundColor: "#F0FFF4" },
  stageItemText: { fontSize: 15, color: "#666" },
  stageItemTextSelected: { color: "#34C759", fontWeight: "600" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  modalButtonCancel: { backgroundColor: "#E5E5EA" },
  modalButtonPrimary: { backgroundColor: "#34C759" },
  modalButtonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  modalButtonTextPrimary: { fontSize: 16, fontWeight: "600", color: "#fff" },
  backButton: { backgroundColor: "#007AFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
});