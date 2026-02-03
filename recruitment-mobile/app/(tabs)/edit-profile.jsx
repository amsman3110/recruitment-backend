import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiPost } from "../services/api";

const BACKEND_URL =
  "https://recruitment-backend-production-6075.up.railway.app";

export default function EditProfileScreen() {
  const router = useRouter();

  const nameState = useState("");
  const jobTitleState = useState("");
  const specializationState = useState("");
  const summaryState = useState("");

  const photoState = useState(null);
  const cvUrlState = useState(null);
  const cvNameState = useState(null);
  const loadingState = useState(false);

  const name = nameState[0];
  const setName = nameState[1];

  const currentJobTitle = jobTitleState[0];
  const setCurrentJobTitle = jobTitleState[1];

  const specialization = specializationState[0];
  const setSpecialization = specializationState[1];

  const profileSummary = summaryState[0];
  const setProfileSummary = summaryState[1];

  const photoUrl = photoState[0];
  const setPhotoUrl = photoState[1];

  const cvUrl = cvUrlState[0];
  const setCvUrl = cvUrlState[1];

  const cvName = cvNameState[0];
  const setCvName = cvNameState[1];

  const loading = loadingState[0];
  const setLoading = loadingState[1];

  useEffect(function () {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await apiGet("/candidates/me");

      setName(profile?.name || "");
      setCurrentJobTitle(profile?.current_job_title || "");
      setSpecialization(profile?.specialization || "");
      setProfileSummary(profile?.profile_summary || "");

      if (profile?.photo_base64) {
        setPhotoUrl("data:image/jpeg;base64," + profile.photo_base64);
      }

      if (profile?.cv_base64) {
        setCvUrl("data:application/pdf;base64," + profile.cv_base64);
      }
    } catch {}
  }

  async function uploadFile(kind, uri, filename, mimeType) {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append(kind, {
      uri: uri,
      name: filename,
      type: mimeType,
    });

    try {
      setLoading(true);

      const response = await fetch(
        BACKEND_URL + "/candidates/upload/" + kind,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data?.error || "Upload failed");
        return;
      }

      if (kind === "photo") {
        setPhotoUrl(data.photo_url);
      } else {
        setCvUrl(data.cv_url);
        setCvName(filename);
      }
    } catch {
      Alert.alert("Error", "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled) return;

    uploadFile(
      "photo",
      result.assets[0].uri,
      "photo.jpg",
      "image/jpeg"
    );
  }

  async function handlePickCV() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.canceled) return;

    setCvName(result.assets[0].name);
    uploadFile(
      "cv",
      result.assets[0].uri,
      result.assets[0].name,
      "application/pdf"
    );
  }

  async function handleSave() {
    try {
      setLoading(true);

      await apiPost("/candidates/me", {
        name,
        current_job_title: currentJobTitle,
        specialization,
        profile_summary: profileSummary,
        photo_url: photoUrl,
        cv_url: cvUrl,
      });

      Alert.alert("Success", "Profile saved");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity onPress={handlePickPhoto}>
        <Image
          style={styles.avatar}
          source={
            photoUrl
              ? { uri: photoUrl }
              : require("../../assets/images/avatar-placeholder.png")
          }
        />
        <Text style={styles.link}>Upload Photo</Text>
      </TouchableOpacity>

      <Input label="Name" value={name} onChange={setName} />
      <Input
        label="Current Job Title"
        value={currentJobTitle}
        onChange={setCurrentJobTitle}
      />
      <Input
        label="Specialization"
        value={specialization}
        onChange={setSpecialization}
      />
      <Input
        label="Profile Summary"
        value={profileSummary}
        onChange={setProfileSummary}
        multiline
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handlePickCV}>
        <Text style={styles.uploadText}>
          {cvName ? "CV: " + cvName : "Upload CV (PDF)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Input(props) {
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
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 8,
  },
  link: {
    color: "#60a5fa",
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    color: "#cbd5f5",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
  },
  multiline: {
    height: 100,
  },
  uploadBtn: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  uploadText: {
    color: "#fff",
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
