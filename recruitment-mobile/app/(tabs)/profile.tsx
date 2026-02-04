import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet } from "../services/api";

export default function CandidateProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCV, setDownloadingCV] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      return undefined;
    }, [])
  );

  async function loadProfile() {
    // LOG TOKEN FOR DEBUGGING
    const token = await AsyncStorage.getItem("token");
    console.log("🔑 YOUR TOKEN:", token);
    
    setLoading(true);
    try {
      const data = await apiGet("/candidate/profile");
      
      console.log("=== PROFILE LOADED ===");
      console.log("📸 Photo URL exists:", !!data.photo_url);
      console.log("📄 CV URL exists:", !!data.cv_url);
      console.log("📄 CV filename:", data.cv_filename);
      console.log("📄 CV uploaded at:", data.cv_uploaded_at);
      
      setProfile(data || {});
    } catch (err) {
      console.log("Failed to load profile", err);
      setProfile({});
    } finally {
      setLoading(false);
    }
  }

  const extractFilename = (url: string) => {
    if (url.startsWith("data:application/pdf")) {
      return "Resume.pdf";
    }
    const parts = url.split("/");
    return parts[parts.length - 1] || "document.pdf";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const base64ToFile = async (base64String: string, filename: string) => {
    try {
      const FS = require('expo-file-system/legacy');
      
      console.log("=== CONVERTING BASE64 TO FILE ===");
      
      const base64Data = base64String.includes("base64,")
        ? base64String.split("base64,")[1]
        : base64String;
      
      console.log("Base64 data length:", base64Data.length);
      
      const fileUri = FS.cacheDirectory + filename;
      console.log("File URI:", fileUri);
      
      await FS.writeAsStringAsync(fileUri, base64Data, {
        encoding: 'base64',
      });
      
      console.log("✅ File written successfully!");
      return fileUri;
    } catch (error) {
      console.error("❌ Error converting base64 to file:", error);
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
      const Sharing = require('expo-sharing');
      
      console.log("=== VIEW CV START ===");
      
      const filename = profile.cv_filename || "Resume.pdf";
      console.log("Filename:", filename);
      
      const fileUri = await base64ToFile(profile.cv_url, filename);
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (!isSharingAvailable) {
        Alert.alert(
          "Not Available",
          "Sharing is not available on this device."
        );
        return;
      }
      
      console.log("Opening share dialog...");
      
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "View CV",
        UTI: "com.adobe.pdf",
      });
      
      console.log("✅ Share dialog closed");
    } catch (error: any) {
      console.error("❌ Error viewing CV:", error);
      Alert.alert("Error", error.message || "Could not open CV. Please try again.");
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
      const Sharing = require('expo-sharing');
      
      console.log("=== SHARE CV START ===");
      
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
      
      console.log("✅ CV shared successfully");
    } catch (error: any) {
      console.error("❌ Error sharing CV:", error);
      Alert.alert("Error", error.message || "Could not share CV. Please try again.");
    } finally {
      setDownloadingCV(false);
    }
  };

  if (loading || !profile) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#ffffff" }}>Loading profile...</Text>
      </View>
    );
  }

  const cvFilename = profile.cv_filename || (profile.cv_url ? extractFilename(profile.cv_url) : null);
  const cvUploadDate = profile.cv_uploaded_at ? formatDate(profile.cv_uploaded_at) : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/edit-profile")}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        {profile.photo_url ? (
          <Image
            source={{ uri: profile.photo_url }}
            style={styles.photo}
            onError={(error) => {
              console.log("❌ Image load error:", error.nativeEvent.error);
            }}
            onLoad={() => {
              console.log("✅ Image loaded successfully");
            }}
          />
        ) : (
          <Image
            source={{ uri: "https://via.placeholder.com/120" }}
            style={styles.photo}
          />
        )}
      </View>

      <Text style={styles.name}>{profile.name || "No name yet"}</Text>
      <Text style={styles.title}>{profile.current_job_title || ""}</Text>
      <Text style={styles.specialization}>{profile.specialization || ""}</Text>

      <Section title="Profile Summary">
        <Text style={styles.text}>
          {profile.profile_summary || "No summary yet"}
        </Text>
      </Section>

      <Section title="CV">
        {profile.cv_url ? (
          <View style={styles.cvContainer}>
            <View style={styles.cvInfo}>
              <Text style={styles.cvIcon}>📄</Text>
              <View style={styles.cvDetails}>
                <Text style={styles.cvFilename}>{cvFilename}</Text>
                {cvUploadDate && (
                  <Text style={styles.cvDate}>Uploaded: {cvUploadDate}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.cvButtonsContainer}>
              <TouchableOpacity
                style={[styles.cvButton, styles.viewButton]}
                onPress={handleViewCV}
                disabled={downloadingCV}
              >
                <Text style={styles.cvButtonText}>
                  {downloadingCV ? "Loading..." : "View CV"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cvButton, styles.shareButton]}
                onPress={handleShareCV}
                disabled={downloadingCV}
              >
                <Text style={styles.cvButtonText}>
                  {downloadingCV ? "Loading..." : "Share"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.text}>No CV uploaded</Text>
        )}
      </Section>

      <Section title="Technical Skills">
        {(profile.technical_skills || []).length > 0 ? (
          profile.technical_skills.map(
            (skill: string, index: number) => (
              <Text key={index} style={styles.badge}>
                {skill}
              </Text>
            )
          )
        ) : (
          <Text style={styles.text}>No technical skills added</Text>
        )}
      </Section>

      <Section title="Soft Skills">
        {(profile.soft_skills || []).length > 0 ? (
          profile.soft_skills.map(
            (skill: string, index: number) => (
              <Text key={index} style={styles.badge}>
                {skill}
              </Text>
            )
          )
        ) : (
          <Text style={styles.text}>No soft skills added</Text>
        )}
      </Section>

      <Section title="Experience">
        <Text style={styles.text}>
          {profile.experience || "No experience added"}
        </Text>
      </Section>

      <Section title="Education">
        <Text style={styles.text}>
          {profile.education || "No education added"}
        </Text>
      </Section>

      <Section title="Courses">
        <Text style={styles.text}>
          {profile.courses || "No courses added"}
        </Text>
      </Section>

      <Section title="Certificates">
        <Text style={styles.text}>
          {profile.certificates || "No certificates added"}
        </Text>
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  loading: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },
  editButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  title: {
    color: "#cccccc",
    textAlign: "center",
  },
  specialization: {
    color: "#aaaaaa",
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "600",
  },
  text: {
    color: "#dddddd",
    lineHeight: 20,
  },
  badge: {
    backgroundColor: "#007AFF",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  cvContainer: {
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
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
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cvDate: {
    color: "#aaaaaa",
    fontSize: 13,
  },
  cvButtonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  cvButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  viewButton: {
    backgroundColor: "#007AFF",
  },
  shareButton: {
    backgroundColor: "#34C759",
  },
  cvButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});