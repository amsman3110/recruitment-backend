import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet } from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// THEME COLORS
// ============================================
const COLORS = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceLight: "#2A2A2A",
  surfaceLighter: "#333333",
  primary: "#007AFF",
  primaryLight: "#4DA3FF",
  secondary: "#34C759",
  accent: "#FF9500",
  text: "#ffffff",
  textSecondary: "#cccccc",
  textMuted: "#888888",
  border: "#3D3D3D",
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

const formatDateRange = (startDate, endDate, isCurrent) => {
  const start = formatDate(startDate);
  const end = isCurrent ? "Present" : formatDate(endDate);
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
};

const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const extractFilename = (url) => {
  if (!url) return "document.pdf";
  if (url.startsWith("data:application/pdf")) {
    return "Resume.pdf";
  }
  const parts = url.split("/");
  return parts[parts.length - 1] || "document.pdf";
};

// ============================================
// SKILLS SECTION COMPONENT
// ============================================
function SkillsSection({ technicalSkills, softSkills }) {
  if (technicalSkills.length === 0 && softSkills.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Skills</Text>
      </View>

      {technicalSkills.length > 0 && (
        <View style={styles.skillCategory}>
          <Text style={styles.skillCategoryTitle}>Technical Skills</Text>
          <View style={styles.skillsContainer}>
            {technicalSkills.map((skill, index) => (
              <View key={`tech-${index}`} style={styles.skillBadge}>
                <Text style={styles.skillBadgeText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {softSkills.length > 0 && (
        <View style={styles.skillCategory}>
          <Text style={styles.skillCategoryTitle}>Soft Skills</Text>
          <View style={styles.skillsContainer}>
            {softSkills.map((skill, index) => (
              <View key={`soft-${index}`} style={[styles.skillBadge, styles.softSkillBadge]}>
                <Text style={styles.skillBadgeText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================
// EXPERIENCE SECTION COMPONENT
// ============================================
function ExperienceSection({ experiences }) {
  if (experiences.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Work Experience</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{experiences.length}</Text>
        </View>
      </View>

      {experiences.map((exp, index) => (
        <View key={`exp-${index}`} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <View style={[styles.entryIcon, { backgroundColor: COLORS.primary + "20" }]}>
              <Ionicons name="briefcase" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.entryHeaderContent}>
              <Text style={styles.entryTitle}>{exp.job_title || "Job Title"}</Text>
              <Text style={styles.entrySubtitle}>{exp.company_name || "Company"}</Text>
            </View>
            {exp.is_current && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>

          <View style={styles.entryMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>
                {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
              </Text>
            </View>
          </View>

          {exp.description && (
            <Text style={styles.entryDescription}>{exp.description}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ============================================
// EDUCATION SECTION COMPONENT
// ============================================
function EducationSection({ educations }) {
  if (educations.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="school-outline" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Education</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{educations.length}</Text>
        </View>
      </View>

      {educations.map((edu, index) => (
        <View key={`edu-${index}`} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <View style={[styles.entryIcon, { backgroundColor: COLORS.secondary + "20" }]}>
              <Ionicons name="school" size={18} color={COLORS.secondary} />
            </View>
            <View style={styles.entryHeaderContent}>
              <Text style={styles.entryTitle}>
                {edu.degree_type || "Degree"}
                {edu.specialization ? ` in ${edu.specialization}` : ""}
              </Text>
              <Text style={styles.entrySubtitle}>{edu.institution || "Institution"}</Text>
            </View>
          </View>

          <View style={styles.entryMeta}>
            {edu.country && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{edu.country}</Text>
              </View>
            )}
            {(edu.start_date || edu.end_date) && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>
                  {formatDateRange(edu.start_date, edu.end_date)}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// CERTIFICATIONS SECTION COMPONENT
// ============================================
function CertificationsSection({ certifications }) {
  if (certifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="ribbon-outline" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{certifications.length}</Text>
        </View>
      </View>

      {certifications.map((cert, index) => (
        <View key={`cert-${index}`} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <View style={[styles.entryIcon, { backgroundColor: COLORS.accent + "20" }]}>
              <Ionicons name="ribbon" size={18} color={COLORS.accent} />
            </View>
            <View style={styles.entryHeaderContent}>
              <Text style={styles.entryTitle}>{cert.name || "Certification"}</Text>
              <Text style={styles.entrySubtitle}>
                {cert.granting_institution || "Institution"}
              </Text>
            </View>
          </View>

          <View style={styles.entryMeta}>
            {cert.specialization && (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{cert.specialization}</Text>
              </View>
            )}
            {cert.granting_date && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{formatDate(cert.granting_date)}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// COURSES SECTION COMPONENT
// ============================================
function CoursesSection({ courses }) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="book-outline" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Courses</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{courses.length}</Text>
        </View>
      </View>

      {courses.map((course, index) => (
        <View key={`course-${index}`} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <View style={[styles.entryIcon, { backgroundColor: COLORS.success + "20" }]}>
              <Ionicons name="book" size={18} color={COLORS.success} />
            </View>
            <View style={styles.entryHeaderContent}>
              <Text style={styles.entryTitle}>{course.name || "Course"}</Text>
              <Text style={styles.entrySubtitle}>
                {course.granting_institution || "Provider"}
              </Text>
            </View>
          </View>

          <View style={styles.entryMeta}>
            {course.specialization && (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{course.specialization}</Text>
              </View>
            )}
            {course.granting_date && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{formatDate(course.granting_date)}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// CV SECTION COMPONENT
// ============================================
function CVSection({ cvUrl, cvFilename, cvUploadedAt, onView, onShare, downloading }) {
  if (!cvUrl) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>CV</Text>
        </View>
        <Text style={styles.noDataText}>No CV uploaded</Text>
      </View>
    );
  }

  const filename = cvFilename || extractFilename(cvUrl);
  const uploadDate = cvUploadedAt
    ? new Date(cvUploadedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>CV</Text>
      </View>

      <View style={styles.cvCard}>
        <View style={styles.cvInfo}>
          <Text style={styles.cvIcon}>📄</Text>
          <View style={styles.cvDetails}>
            <Text style={styles.cvFilename}>{filename}</Text>
            {uploadDate && <Text style={styles.cvDate}>Uploaded: {uploadDate}</Text>}
          </View>
        </View>

        <View style={styles.cvButtons}>
          <TouchableOpacity
            style={[styles.cvButton, styles.viewButton]}
            onPress={onView}
            disabled={downloading}
          >
            <Text style={styles.cvButtonText}>
              {downloading ? "Loading..." : "View CV"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cvButton, styles.shareButton]}
            onPress={onShare}
            disabled={downloading}
          >
            <Text style={styles.cvButtonText}>
              {downloading ? "Loading..." : "Share"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CandidateProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingCV, setDownloadingCV] = useState(false);

  // Parsed arrays
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [courses, setCourses] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      return undefined;
    }, [])
  );

  async function loadProfile() {
    if (!refreshing) {
      setLoading(true);
    }

    try {
      const token = await AsyncStorage.getItem("token");
      console.log("🔑 YOUR TOKEN:", token);

      const data = await apiGet("/candidate/profile");

      console.log("=== PROFILE LOADED ===");
      console.log("📸 Photo URL exists:", !!data.photo_url);
      console.log("📄 CV URL exists:", !!data.cv_url);

      setProfile(data || {});

      // Parse all array fields
      setTechnicalSkills(parseArrayField(data.technical_skills));
      setSoftSkills(parseArrayField(data.soft_skills));
      setExperiences(parseArrayField(data.experience));
      setEducations(parseArrayField(data.education));
      setCertifications(parseArrayField(data.certificates));
      setCourses(parseArrayField(data.courses));

    } catch (err) {
      console.log("Failed to load profile", err);
      setProfile({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  // ============================================
  // CV FUNCTIONS (EXISTING - DO NOT TOUCH)
  // ============================================
  const base64ToFile = async (base64String, filename) => {
    try {
      const FS = require("expo-file-system/legacy");

      const base64Data = base64String.includes("base64,")
        ? base64String.split("base64,")[1]
        : base64String;

      const fileUri = FS.cacheDirectory + filename;

      await FS.writeAsStringAsync(fileUri, base64Data, {
        encoding: "base64",
      });

      return fileUri;
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      throw error;
    }
  };

  const handleViewCV = async () => {
    if (!profile.cv_url) {
      Alert.alert("No CV", "No CV has been uploaded yet.");
      return;
    }

    setDownloadingCV(true);

    try {
      const Sharing = require("expo-sharing");
      const filename = profile.cv_filename || "Resume.pdf";
      const fileUri = await base64ToFile(profile.cv_url, filename);
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        Alert.alert("Not Available", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "View CV",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error viewing CV:", error);
      Alert.alert("Error", error.message || "Could not open CV.");
    } finally {
      setDownloadingCV(false);
    }
  };

  const handleShareCV = async () => {
    if (!profile.cv_url) {
      Alert.alert("No CV", "No CV has been uploaded yet.");
      return;
    }

    setDownloadingCV(true);

    try {
      const Sharing = require("expo-sharing");
      const filename = profile.cv_filename || "Resume.pdf";
      const fileUri = await base64ToFile(profile.cv_url, filename);
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        Alert.alert("Not Available", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share CV",
      });
    } catch (error) {
      console.error("Error sharing CV:", error);
      Alert.alert("Error", error.message || "Could not share CV.");
    } finally {
      setDownloadingCV(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Check if profile has any content
  const hasContent =
    technicalSkills.length > 0 ||
    softSkills.length > 0 ||
    experiences.length > 0 ||
    educations.length > 0 ||
    certifications.length > 0 ||
    courses.length > 0;

  // ============================================
  // RENDER
  // ============================================
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/edit-profile")}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Photo & Basic Info */}
      <View style={styles.profileHeader}>
        <View style={styles.photoContainer}>
          {profile.photo_url ? (
            <Image
              source={{ uri: profile.photo_url }}
              style={styles.photo}
              onError={(error) => console.log("Image error:", error.nativeEvent.error)}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={50} color={COLORS.textMuted} />
            </View>
          )}
        </View>

        <Text style={styles.name}>{profile.name || "No name yet"}</Text>
        <Text style={styles.title}>{profile.current_job_title || ""}</Text>
        <Text style={styles.specialization}>{profile.specialization || ""}</Text>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => router.push("/edit-profile")}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.text} />
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Summary */}
      {profile.profile_summary && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.summaryText}>{profile.profile_summary}</Text>
        </View>
      )}

      {/* CV Section */}
      <CVSection
        cvUrl={profile.cv_url}
        cvFilename={profile.cv_filename}
        cvUploadedAt={profile.cv_uploaded_at}
        onView={handleViewCV}
        onShare={handleShareCV}
        downloading={downloadingCV}
      />

      {/* Content Sections */}
      {hasContent ? (
        <>
          <SkillsSection
            technicalSkills={technicalSkills}
            softSkills={softSkills}
          />
          <ExperienceSection experiences={experiences} />
          <EducationSection educations={educations} />
          <CertificationsSection certifications={certifications} />
          <CoursesSection courses={courses} />
        </>
      ) : (
        <View style={styles.emptyProfile}>
          <Ionicons name="document-text-outline" size={60} color={COLORS.textMuted} />
          <Text style={styles.emptyProfileTitle}>Complete Your Profile</Text>
          <Text style={styles.emptyProfileText}>
            Add your skills, experience, education, and certifications to stand out.
          </Text>
          <TouchableOpacity
            style={styles.completeProfileButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.text} />
            <Text style={styles.completeProfileButtonText}>Add Information</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 16,
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 40,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "bold",
  },
  editButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Profile Header
  profileHeader: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  photoContainer: {
    marginBottom: 16,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceLighter,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  specialization: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editProfileButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  noDataText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // Skills
  skillCategory: {
    marginBottom: 16,
  },
  skillCategoryTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  softSkillBadge: {
    backgroundColor: COLORS.secondary,
  },
  skillBadgeText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
  },

  // Entry Card
  entryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  entryHeaderContent: {
    flex: 1,
  },
  entryTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  entrySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  currentBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  currentBadgeText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  entryMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 48,
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginLeft: 6,
  },
  entryDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    marginLeft: 48,
  },

  // CV Card
  cvCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cvInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cvIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cvDetails: {
    flex: 1,
  },
  cvFilename: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cvDate: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  cvButtons: {
    flexDirection: "row",
    gap: 8,
  },
  cvButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.success,
  },
  cvButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 14,
  },

  // Empty Profile
  emptyProfile: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 40,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  emptyProfileTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyProfileText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  completeProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  completeProfileButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});