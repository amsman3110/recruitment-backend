import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiGet, apiPut } from "../services/api";

export default function CompanyProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    specialization: "",
    number_of_employees: "",
    company_summary: "",
    office_location: "",
    linkedin_url: "",
    website_url: "",
    logo_base64: null,
  });

  useEffect(() => {
    loadProfile();
    requestPermissions();
  }, []);

  async function requestPermissions() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photos to upload company logo"
      );
    }
  }

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await apiGet("/company/profile");
      console.log("Company profile:", data);
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.status === 404) {
        setProfile(null);
      } else {
        Alert.alert("Error", "Failed to load company profile");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

  function openEditModal() {
    setFormData({
      company_name: profile?.company_name || "",
      industry: profile?.industry || "",
      specialization: profile?.specialization || "",
      number_of_employees: profile?.number_of_employees || "",
      company_summary: profile?.company_summary || "",
      office_location: profile?.office_location || "",
      linkedin_url: profile?.linkedin_url || "",
      website_url: profile?.website_url || "",
      logo_base64: profile?.logo_base64 || null,
    });
    setShowEditModal(true);
  }

  async function pickImage() {
    try {
      setUploadingImage(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Compress to reduce size
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        // Convert to data URI format
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFormData({ ...formData, logo_base64: base64Image });
        Alert.alert("Success", "Logo uploaded! Don't forget to save.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function takePicture() {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is required");
        return;
      }

      setUploadingImage(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFormData({ ...formData, logo_base64: base64Image });
        Alert.alert("Success", "Photo taken! Don't forget to save.");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture");
    } finally {
      setUploadingImage(false);
    }
  }

  function showImageOptions() {
    Alert.alert(
      "Company Logo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePicture },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }

  async function handleSave() {
    if (!formData.company_name.trim()) {
      Alert.alert("Error", "Company name is required");
      return;
    }

    // Validate URLs if provided
    if (formData.linkedin_url && !isValidUrl(formData.linkedin_url)) {
      Alert.alert("Error", "Please enter a valid LinkedIn URL");
      return;
    }

    if (formData.website_url && !isValidUrl(formData.website_url)) {
      Alert.alert("Error", "Please enter a valid website URL");
      return;
    }

    try {
      const data = await apiPut("/company/profile", formData);
      setProfile(data);
      setShowEditModal(false);
      Alert.alert("Success", "Company profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update company profile");
    }
  }

  function isValidUrl(url) {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(url);
    } catch (e) {
      return false;
    }
  }

  async function openUrl(url) {
    try {
      // Add https:// if not present
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }
      
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open URL");
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading company profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Company Profile</Text>
          <Text style={styles.subtitle}>Set up your company</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={styles.emptyTitle}>No Company Profile</Text>
          <Text style={styles.emptyText}>
            Create your company profile to attract top talent
          </Text>
          <Pressable style={styles.emptyButton} onPress={openEditModal}>
            <Text style={styles.emptyButtonText}>Create Profile</Text>
          </Pressable>
        </View>

        {/* Edit Modal */}
        <EditModal
          visible={showEditModal}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
          onPickImage={showImageOptions}
          uploadingImage={uploadingImage}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Company Profile</Text>
          <Text style={styles.subtitle}>{profile.company_name}</Text>
        </View>
        <Pressable style={styles.editButton} onPress={openEditModal}>
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.profileCard}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            {profile.logo_base64 ? (
              <Image 
                source={{ uri: profile.logo_base64 }} 
                style={styles.logoImage}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>
                  {profile.company_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Company Info */}
          <View style={styles.infoSection}>
            <Text style={styles.companyName}>{profile.company_name}</Text>

            {profile.industry && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Industry:</Text>
                <Text style={styles.infoValue}>{profile.industry}</Text>
              </View>
            )}

            {profile.specialization && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Specialization:</Text>
                <Text style={styles.infoValue}>{profile.specialization}</Text>
              </View>
            )}

            {profile.number_of_employees && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employees:</Text>
                <Text style={styles.infoValue}>
                  {profile.number_of_employees}
                </Text>
              </View>
            )}

            {profile.office_location && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Location:</Text>
                <Text style={styles.infoValue}>{profile.office_location}</Text>
              </View>
            )}

            {/* LinkedIn Link */}
            {profile.linkedin_url && (
              <Pressable 
                style={styles.linkRow}
                onPress={() => openUrl(profile.linkedin_url)}
              >
                <Text style={styles.infoLabel}>🔗 LinkedIn:</Text>
                <Text style={styles.linkValue} numberOfLines={1}>
                  {profile.linkedin_url}
                </Text>
              </Pressable>
            )}

            {/* Website Link */}
            {profile.website_url && (
              <Pressable 
                style={styles.linkRow}
                onPress={() => openUrl(profile.website_url)}
              >
                <Text style={styles.infoLabel}>🌐 Website:</Text>
                <Text style={styles.linkValue} numberOfLines={1}>
                  {profile.website_url}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Company Summary */}
          {profile.company_summary && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>About Us</Text>
              <Text style={styles.summaryText}>{profile.company_summary}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        onPickImage={showImageOptions}
        uploadingImage={uploadingImage}
      />
    </View>
  );
}

// Separate Edit Modal Component
function EditModal({ visible, formData, setFormData, onClose, onSave, onPickImage, uploadingImage }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {formData.company_name ? "Edit" : "Create"} Company Profile
            </Text>
            <Pressable onPress={onClose}>
              <Text style={styles.modalClose}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Logo Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Logo</Text>
              <Pressable 
                style={styles.logoUploadContainer} 
                onPress={onPickImage}
                disabled={uploadingImage}
              >
                {formData.logo_base64 ? (
                  <Image 
                    source={{ uri: formData.logo_base64 }} 
                    style={styles.logoPreview}
                  />
                ) : (
                  <View style={styles.logoUploadPlaceholder}>
                    <Text style={styles.logoUploadIcon}>📷</Text>
                    <Text style={styles.logoUploadText}>
                      {uploadingImage ? "Uploading..." : "Tap to upload logo"}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., TechCorp Inc."
                value={formData.company_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, company_name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Industry</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Technology, Healthcare"
                value={formData.industry}
                onChangeText={(text) =>
                  setFormData({ ...formData, industry: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Software Development"
                value={formData.specialization}
                onChangeText={(text) =>
                  setFormData({ ...formData, specialization: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Employees</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50-200"
                value={formData.number_of_employees}
                onChangeText={(text) =>
                  setFormData({ ...formData, number_of_employees: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>LinkedIn Page</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., https://linkedin.com/company/yourcompany"
                value={formData.linkedin_url}
                onChangeText={(text) =>
                  setFormData({ ...formData, linkedin_url: text })
                }
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Website</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., https://yourcompany.com"
                value={formData.website_url}
                onChangeText={(text) =>
                  setFormData({ ...formData, website_url: text })
                }
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Summary</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell candidates about your company..."
                multiline
                numberOfLines={4}
                value={formData.company_summary}
                onChangeText={(text) =>
                  setFormData({ ...formData, company_summary: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Office Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Cairo, Egypt"
                value={formData.office_location}
                onChangeText={(text) =>
                  setFormData({ ...formData, office_location: text })
                }
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={onSave}
            >
              <Text style={styles.modalButtonTextPrimary}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F7" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F7" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#8E8E93" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E5EA" },
  title: { fontSize: 28, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 14, color: "#8E8E93", marginTop: 4 },
  editButton: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  editButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  content: { flex: 1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#000", marginBottom: 8 },
  emptyText: { fontSize: 16, color: "#8E8E93", textAlign: "center", marginBottom: 24 },
  emptyButton: { backgroundColor: "#007AFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  profileCard: { backgroundColor: "#fff", margin: 20, borderRadius: 12, padding: 20 },
  logoContainer: { alignItems: "center", marginBottom: 20 },
  logoImage: { width: 100, height: 100, borderRadius: 50 },
  logoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center" },
  logoText: { fontSize: 48, fontWeight: "700", color: "#fff" },
  infoSection: { marginBottom: 20 },
  companyName: { fontSize: 24, fontWeight: "700", color: "#000", textAlign: "center", marginBottom: 16 },
  infoRow: { flexDirection: "row", marginBottom: 12 },
  infoLabel: { fontSize: 16, fontWeight: "600", color: "#8E8E93", width: 130 },
  infoValue: { fontSize: 16, color: "#000", flex: 1 },
  linkRow: { flexDirection: "row", marginBottom: 12 },
  linkValue: { fontSize: 16, color: "#007AFF", textDecorationLine: "underline", flex: 1 },
  summarySection: { borderTopWidth: 1, borderTopColor: "#E5E5EA", paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 12 },
  summaryText: { fontSize: 15, color: "#333", lineHeight: 22 },
  bottomSpacer: { height: 40 },
  
  // Modal styles
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
  
  // Logo upload styles
  logoUploadContainer: { alignItems: "center", marginBottom: 10 },
  logoPreview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "#E5E5EA" },
  logoUploadPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F5F5F7", borderWidth: 2, borderColor: "#E5E5EA", borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
  logoUploadIcon: { fontSize: 40, marginBottom: 8 },
  logoUploadText: { fontSize: 14, color: "#8E8E93", textAlign: "center" },
  
  modalFooter: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#E5E5EA", gap: 12 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  modalButtonCancel: { backgroundColor: "#F5F5F7" },
  modalButtonPrimary: { backgroundColor: "#007AFF" },
  modalButtonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  modalButtonTextPrimary: { fontSize: 16, fontWeight: "600", color: "#fff" },
});