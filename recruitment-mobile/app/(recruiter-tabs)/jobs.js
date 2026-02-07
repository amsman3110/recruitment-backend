import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiDelete, apiGet, apiPost, apiPut } from "../services/api";

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    qualifications: "",
    location: "",
    workplace: "",
    country: "",
    city: "",
    career_level: "",
    job_category: "",
    job_type: "",
    experience_years: "",
    status: "draft",
  });

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await apiGet("/jobs");
      console.log("Jobs loaded:", data.length);
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
      Alert.alert("Error", "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }

  function openCreateModal() {
    setEditingJob(null);
    setFormData({
      title: "",
      description: "",
      qualifications: "",
      location: "",
      workplace: "",
      country: "",
      city: "",
      career_level: "",
      job_category: "",
      job_type: "",
      experience_years: "",
      status: "draft",
    });
    setShowCreateModal(true);
  }

  function openEditModal(job) {
    setEditingJob(job);
    setFormData({
      title: job.title || "",
      description: job.description || "",
      qualifications: job.qualifications || "",
      location: job.location || "",
      workplace: job.workplace || "",
      country: job.country || "",
      city: job.city || "",
      career_level: job.career_level || "",
      job_category: job.job_category || "",
      job_type: job.job_type || "",
      experience_years: job.experience_years ? String(job.experience_years) : "",
      status: job.status || "draft",
    });
    setShowCreateModal(true);
  }

  async function handleSubmit() {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Job title is required");
      return;
    }

    try {
      const payload = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      };

      if (editingJob) {
        await apiPut("/jobs/" + editingJob.id, payload);
        Alert.alert("Success", "Job updated successfully");
      } else {
        await apiPost("/jobs", payload);
        Alert.alert("Success", "Job created successfully");
      }

      setShowCreateModal(false);
      loadJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      Alert.alert("Error", "Failed to save job");
    }
  }

  async function handleDelete(jobId) {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this job?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiDelete("/jobs/" + jobId);
              Alert.alert("Success", "Job deleted successfully");
              loadJobs();
            } catch (error) {
              console.error("Error deleting job:", error);
              Alert.alert("Error", "Failed to delete job");
            }
          },
        },
      ]
    );
  }

  async function handleChangeStatus(jobId, newStatus) {
    try {
      await apiPut("/jobs/" + jobId, { status: newStatus });
      Alert.alert("Success", "Job status updated");
      loadJobs();
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update status");
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "open": return "#34C759";
      case "closed": return "#FF3B30";
      case "draft": return "#FF9500";
      default: return "#8E8E93";
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "open": return "Open";
      case "closed": return "Closed";
      case "draft": return "Draft";
      default: return status;
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Jobs Management</Text>
          <Text style={styles.subtitle}>{jobs.length} total jobs</Text>
        </View>
        <Pressable style={styles.createButton} onPress={openCreateModal}>
          <Text style={styles.createButtonText}>+ New Job</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No Jobs Yet</Text>
            <Text style={styles.emptyText}>Create your first job posting to get started</Text>
            <Pressable style={styles.emptyButton} onPress={openCreateModal}>
              <Text style={styles.emptyButtonText}>Create Job</Text>
            </Pressable>
          </View>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleContainer}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(job.status)}</Text>
                  </View>
                </View>
              </View>

              {job.location && (
                <Text style={styles.jobDetail}>📍 {job.location}</Text>
              )}
              {job.job_type && (
                <Text style={styles.jobDetail}>💼 {job.job_type}</Text>
              )}
              {job.experience_years !== null && (
                <Text style={styles.jobDetail}>⏱️ {job.experience_years} years experience</Text>
              )}

              {job.description && (
                <Text style={styles.jobDescription} numberOfLines={2}>
                  {job.description}
                </Text>
              )}

              {/* VIEW APPLICANTS BUTTON */}
              <Pressable
                style={styles.viewApplicantsButton}
                onPress={() => router.push(`/job-detail-recruiter?id=${job.id}`)}
              >
                <Text style={styles.viewApplicantsText}>👥 View Applicants</Text>
              </Pressable>

              <View style={styles.jobActions}>
                <Pressable style={styles.actionBtn} onPress={() => openEditModal(job)}>
                  <Text style={styles.actionBtnText}>✏️ Edit</Text>
                </Pressable>

                {job.status === "draft" && (
                  <Pressable
                    style={[styles.actionBtn, styles.actionBtnSuccess]}
                    onPress={() => handleChangeStatus(job.id, "open")}
                  >
                    <Text style={styles.actionBtnTextWhite}>Publish</Text>
                  </Pressable>
                )}

                {job.status === "open" && (
                  <Pressable
                    style={[styles.actionBtn, styles.actionBtnWarning]}
                    onPress={() => handleChangeStatus(job.id, "closed")}
                  >
                    <Text style={styles.actionBtnTextWhite}>Close</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={() => handleDelete(job.id)}
                >
                  <Text style={styles.actionBtnTextWhite}>🗑️ Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingJob ? "Edit Job" : "Create New Job"}
              </Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Job description..."
                  multiline
                  numberOfLines={4}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Qualifications</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Required qualifications..."
                  multiline
                  numberOfLines={3}
                  value={formData.qualifications}
                  onChangeText={(text) => setFormData({ ...formData, qualifications: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Cairo, Egypt"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Job Type</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Full-time, Part-time"
                  value={formData.job_type}
                  onChangeText={(text) => setFormData({ ...formData, job_type: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Experience Years</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 3"
                  keyboardType="numeric"
                  value={formData.experience_years}
                  onChangeText={(text) => setFormData({ ...formData, experience_years: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusButtons}>
                  <Pressable
                    style={[
                      styles.statusButton,
                      formData.status === "draft" && styles.statusButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, status: "draft" })}
                  >
                    <Text style={styles.statusButtonText}>Draft</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.statusButton,
                      formData.status === "open" && styles.statusButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, status: "open" })}
                  >
                    <Text style={styles.statusButtonText}>Open</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmit}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {editingJob ? "Update" : "Create"}
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
  container: { flex: 1, backgroundColor: "#F5F5F7" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F7" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#8E8E93" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  title: { fontSize: 28, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 14, color: "#8E8E93", marginTop: 4 },
  createButton: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  createButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  content: { flex: 1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#000", marginBottom: 8 },
  emptyText: { fontSize: 16, color: "#8E8E93", textAlign: "center", marginBottom: 24 },
  emptyButton: { backgroundColor: "#007AFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  jobCard: { backgroundColor: "#fff", marginHorizontal: 20, marginTop: 12, borderRadius: 12, padding: 16 },
  jobHeader: { marginBottom: 12 },
  jobTitleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  jobTitle: { fontSize: 18, fontWeight: "700", color: "#000", flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  jobDetail: { fontSize: 14, color: "#666", marginBottom: 4 },
  jobDescription: { fontSize: 14, color: "#666", marginTop: 8, marginBottom: 12 },
  viewApplicantsButton: { backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 12, marginBottom: 8 },
  viewApplicantsText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  jobActions: { flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F5F5F7" },
  actionBtn: { flex: 1, backgroundColor: "#F5F5F7", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  actionBtnSuccess: { backgroundColor: "#34C759" },
  actionBtnWarning: { backgroundColor: "#FF9500" },
  actionBtnDanger: { backgroundColor: "#FF3B30" },
  actionBtnText: { fontSize: 14, fontWeight: "600", color: "#000" },
  actionBtnTextWhite: { fontSize: 14, fontWeight: "600", color: "#fff" },
  bottomSpacer: { height: 40 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  modalClose: { fontSize: 32, color: "#8E8E93", fontWeight: "300" },
  modalBody: { paddingHorizontal: 20, paddingVertical: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 8 },
  input: { backgroundColor: "#F5F5F7", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: "#000", borderWidth: 1, borderColor: "#E5E5EA" },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  statusButtons: { flexDirection: "row", gap: 12 },
  statusButton: { flex: 1, backgroundColor: "#F5F5F7", paddingVertical: 12, borderRadius: 8, alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  statusButtonActive: { backgroundColor: "#E5F4FF", borderColor: "#007AFF" },
  statusButtonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  modalFooter: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#E5E5EA", gap: 12 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  modalButtonCancel: { backgroundColor: "#F5F5F7" },
  modalButtonPrimary: { backgroundColor: "#007AFF" },
  modalButtonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  modalButtonTextPrimary: { fontSize: 16, fontWeight: "600", color: "#fff" },
});