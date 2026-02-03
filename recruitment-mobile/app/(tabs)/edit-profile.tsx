import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiPost } from "../services/api";

/* ===============================
   TYPES
================================ */
type Profile = {
  name?: string;
  current_job_title?: string;
  specialization?: string;
  profile_summary?: string;
  technical_skills?: string[];
  soft_skills?: string[];
  experience?: unknown[];
  education?: unknown[];
};

export default function EditProfileScreen() {
  /* ===============================
     STATE
  ================================ */
  const [name, setName] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [profileSummary, setProfileSummary] = useState("");

  const [technicalSkillsText, setTechnicalSkillsText] = useState("");
  const [softSkillsText, setSoftSkillsText] = useState("");

  const [experienceText, setExperienceText] = useState("[]");
  const [educationText, setEducationText] = useState("[]");

  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD PROFILE
  ================================ */
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = (await apiGet("/profile")) as Profile;

        if (profile.name) setName(profile.name);
        if (profile.current_job_title)
          setCurrentJobTitle(profile.current_job_title);
        if (profile.specialization)
          setSpecialization(profile.specialization);
        if (profile.profile_summary)
          setProfileSummary(profile.profile_summary);

        if (Array.isArray(profile.technical_skills)) {
          setTechnicalSkillsText(profile.technical_skills.join(", "));
        }

        if (Array.isArray(profile.soft_skills)) {
          setSoftSkillsText(profile.soft_skills.join(", "));
        }

        setExperienceText(
          JSON.stringify(profile.experience || [], null, 2)
        );
        setEducationText(
          JSON.stringify(profile.education || [], null, 2)
        );
      } catch {
        Alert.alert("Error", "Failed to load profile");
      }
    }

    loadProfile();
  }, []);

  /* ===============================
     SAVE PROFILE
  ================================ */
  async function handleSave() {
    if (name.trim() === "") {
      Alert.alert("Validation Error", "Name is required");
      return;
    }

    let experience: unknown[];
    let education: unknown[];

    try {
      experience = JSON.parse(experienceText);
      education = JSON.parse(educationText);
    } catch {
      Alert.alert(
        "Invalid JSON",
        "Experience or Education JSON is invalid"
      );
      return;
    }

    try {
      setLoading(true);

      await apiPost("/profile", {
        name: name.trim(),
        current_job_title: currentJobTitle.trim(),
        specialization: specialization.trim(),
        profile_summary: profileSummary.trim(),
        technical_skills: technicalSkillsText.split(",").map((item) =>
          item.trim()
        ),
        soft_skills: softSkillsText.split(",").map((item) =>
          item.trim()
        ),
        experience,
        education,
      });

      Alert.alert("Success", "Profile saved successfully");
    } catch {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI
  ================================ */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Field label="Name *" value={name} onChange={setName} />
      <Field
        label="Current Job Title"
        value={currentJobTitle}
        onChange={setCurrentJobTitle}
      />
      <Field
        label="Specialization"
        value={specialization}
        onChange={setSpecialization}
      />
      <Field
        label="Profile Summary"
        value={profileSummary}
        onChange={setProfileSummary}
        multiline
      />

      <Field
        label="Technical Skills (comma separated)"
        value={technicalSkillsText}
        onChange={setTechnicalSkillsText}
      />
      <Field
        label="Soft Skills (comma separated)"
        value={softSkillsText}
        onChange={setSoftSkillsText}
      />

      <Field
        label="Experience (JSON array)"
        value={experienceText}
        onChange={setExperienceText}
        multiline
      />
      <Field
        label="Education (JSON array)"
        value={educationText}
        onChange={setEducationText}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ===============================
   FIELD COMPONENT
================================ */
function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChange}
        style={[
          styles.input,
          props.multiline ? styles.multiline : null,
        ]}
        multiline={props.multiline}
      />
    </View>
  );
}

/* ===============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  label: {
    color: "#cbd5f5",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multiline: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
