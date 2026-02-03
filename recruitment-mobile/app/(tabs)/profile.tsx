import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await apiGet<any>("/candidate/profile");
      setProfile(data || {});
    } catch (err) {
      console.log("Failed to load profile", err);
      setProfile({});
    }
  }

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#ffffff" }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/edit-profile")}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Photo */}
      <View style={styles.photoContainer}>
        <Image
          source={{
            uri: profile.photo_url || "https://via.placeholder.com/120",
          }}
          style={styles.photo}
        />
      </View>

      {/* Basic Info */}
      <Text style={styles.name}>{profile.name || "No name yet"}</Text>
      <Text style={styles.title}>
        {profile.current_job_title || ""}
      </Text>
      <Text style={styles.specialization}>
        {profile.specialization || ""}
      </Text>

      {/* Profile Summary */}
      <Section title="Profile Summary">
        <Text style={styles.text}>
          {profile.profile_summary || "No summary yet"}
        </Text>
      </Section>

      {/* CV */}
      <Section title="CV">
        <Text style={styles.text}>
          {profile.cv_url
            ? `File: ${profile.cv_url}`
            : "No CV uploaded"}
        </Text>
      </Section>

      {/* Technical Skills */}
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

      {/* Soft Skills */}
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

      {/* Experience */}
      <Section title="Experience">
        <Text style={styles.text}>
          {profile.experience || "No experience added"}
        </Text>
      </Section>

      {/* Education */}
      <Section title="Education">
        <Text style={styles.text}>
          {profile.education || "No education added"}
        </Text>
      </Section>

      {/* Courses */}
      <Section title="Courses">
        <Text style={styles.text}>
          {profile.courses || "No courses added"}
        </Text>
      </Section>

      {/* Certificates */}
      <Section title="Certificates">
        <Text style={styles.text}>
          {profile.certificates || "No certificates added"}
        </Text>
      </Section>
    </ScrollView>
  );
}

/**
 * Reusable Section Component
 */
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
});
