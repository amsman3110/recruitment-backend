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

const BACKEND_URL = "https://recruitment-backend-cm12.onrender.com";

export default function EditProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [profileSummary, setProfileSummary] = useState("");

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvName, setCvName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await apiGet("/profile");
      setName(profile?.name || "");
      setCurrentJobTitle(profile?.current_job_title || "");
      setSpecialization(profile?.specialization || "");
      setProfileSummary(profile?.profile_summary || "");
      setPhotoUrl(profile?.photo_url || null);
      setCvUrl(profile?.cv_url || null);
    } catch {}
  }

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    const image = result.assets[0];
    const formData = new FormData();

    formData.append("photo", {
      uri: image.uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/upload/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setPhotoUrl(data.photo_url);
    } catch {
      Alert.alert("Error", "Photo upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePickCV() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.canceled) return;

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    const file = result.assets[0];
    setCvName(file.name);

    const formData = new FormData();
    formData.append("cv", {
      uri: file.uri,
      name: file.name,
      type: "application/pdf",
    } as any);

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/upload/cv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setCvUrl(data.cv_url);
    } catch {
      Alert.alert("Error", "CV upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setLoading(true);

      await apiPost("/profile", {
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
              ? { uri: `${BACKEND_URL}${photoUrl}` }
              : require("../../assets/images/avatar-placeholder.png")
          }
        />
        <Text style={styles.link}>Change Photo</Text>
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
          {cvName ? `CV: ${cvName}` : "Upload CV (PDF)"}
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

function Input({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, multiline ? styles.multiline : null]}
        multiline={multiline}
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
