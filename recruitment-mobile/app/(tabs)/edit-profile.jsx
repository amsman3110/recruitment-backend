import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
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

export default function EditProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [summary, setSummary] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [cvUrl, setCvUrl] = useState(null);
  const [cvName, setCvName] = useState(null);
  const [cvChanged, setCvChanged] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [courses, setCourses] = useState("");
  const [certificates, setCertificates] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await apiGet("/candidate/profile");
        const data = profile || {};
        setName(data.name || "");
        setJobTitle(data.current_job_title || "");
        setSpecialization(data.specialization || "");
        setSummary(data.profile_summary || "");
        setPhoto(data.photo_url || null);
        setCvUrl(data.cv_url || null);
        setTechnicalSkills(data.technical_skills || []);
        setSoftSkills(data.soft_skills || []);
        setExperience(data.experience || "");
        setEducation(data.education || "");
        setCourses(data.courses || "");
        setCertificates(data.certificates || "");
      } catch (error) {
        console.log("Error loading profile:", error);
        Alert.alert("Error", "Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      setPhotoChanged(true);
    }
  };

  const pickCV = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.type === "success") {
      setCvUrl(result.uri);
      setCvName(result.name);
      setCvChanged(true);
    }
  };

  const uploadPhoto = async () => {
    try {
      console.log("Converting photo to base64...");
      
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(photo, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Uploading photo to backend...");
      
      const result = await apiPost("/candidates/upload/photo", {
        photo_base64: base64,
      });
      
      console.log("Photo uploaded successfully!");
      return result.photo_url;
    } catch (error) {
      console.log("Photo upload error:", error);
      Alert.alert("Photo Upload Failed", "Could not upload photo. Continuing without it.");
      return photo;
    }
  };

  const uploadCV = async () => {
    try {
      console.log("Converting CV to base64...");
      
      const base64 = await FileSystem.readAsStringAsync(cvUrl, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Uploading CV to backend...");
      
      const result = await apiPost("/candidates/upload/cv", {
        cv_base64: base64,
      });
      
      console.log("CV uploaded successfully!");
      return result.cv_url;
    } catch (error) {
      console.log("CV upload error:", error);
      Alert.alert("CV Upload Failed", "Could not upload CV. Continuing without it.");
      return cvUrl;
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      let savedPhotoUrl = photo;
      let savedCvUrl = cvUrl;

      // If photo changed and is a local file (not a data URL), upload it
      if (photoChanged && photo && !photo.startsWith("data:")) {
        const newPhotoUrl = await uploadPhoto();
        if (newPhotoUrl) {
          savedPhotoUrl = newPhotoUrl;
        }
      }

      // If CV changed and is a local file, upload it
      if (cvChanged && cvUrl && !cvUrl.startsWith("data:")) {
        const newCvUrl = await uploadCV();
        if (newCvUrl) {
          savedCvUrl = newCvUrl;
        }
      }

      const profileData = {
        name: name,
        jobTitle: jobTitle,
        specialization: specialization,
        summary: summary,
        photo_url: savedPhotoUrl,
        cv_url: savedCvUrl,
        technicalSkills: technicalSkills,
        softSkills: softSkills,
        experience: experience,
        education: education,
        courses: courses,
        certificates: certificates,
      };

      await apiPost("/candidate/update-profile", profileData);

      Alert.alert("Success", "Profile updated successfully!");
      router.push("/profile");
    } catch (error) {
      console.log("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#ffffff", textAlign: "center", marginTop: 40 }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        <Image
          source={{
            uri: photo || "https://via.placeholder.com/120",
          }}
          style={styles.photo}
        />
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Job Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Job Title"
        placeholderTextColor="#888"
        value={jobTitle}
        onChangeText={setJobTitle}
      />

      <Text style={styles.label}>Specialization</Text>
      <TextInput
        style={styles.input}
        placeholder="Specialization"
        placeholderTextColor="#888"
        value={specialization}
        onChangeText={setSpecialization}
      />

      <Text style={styles.label}>Profile Summary</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Profile Summary"
        placeholderTextColor="#888"
        value={summary}
        onChangeText={setSummary}
        multiline={true}
      />

      <Text style={styles.label}>CV (PDF)</Text>
      <View style={styles.cvContainer}>
        <TouchableOpacity onPress={pickCV} style={styles.cvButton}>
          <Text style={styles.changeCVText}>
            {cvChanged ? "CV Selected ✓" : cvUrl ? "Change CV" : "Upload CV"}
          </Text>
        </TouchableOpacity>
        {cvName && <Text style={styles.cvNameText}>📄 {cvName}</Text>}
      </View>

      <Text style={styles.label}>Technical Skills (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. React, Node.js, SQL"
        placeholderTextColor="#888"
        value={technicalSkills.join(", ")}
        onChangeText={(text) =>
          setTechnicalSkills(text.split(",").map((s) => s.trim()).filter(Boolean))
        }
      />

      <Text style={styles.label}>Soft Skills (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Communication, Teamwork"
        placeholderTextColor="#888"
        value={softSkills.join(", ")}
        onChangeText={(text) =>
          setSoftSkills(text.split(",").map((s) => s.trim()).filter(Boolean))
        }
      />

      <Text style={styles.label}>Experience</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Describe your experience"
        placeholderTextColor="#888"
        value={experience}
        onChangeText={setExperience}
        multiline={true}
      />

      <Text style={styles.label}>Education</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Computer Science, MIT"
        placeholderTextColor="#888"
        value={education}
        onChangeText={setEducation}
      />

      <Text style={styles.label}>Courses</Text>
      <TextInput
        style={styles.input}
        placeholder="Any relevant courses"
        placeholderTextColor="#888"
        value={courses}
        onChangeText={setCourses}
      />

      <Text style={styles.label}>Certificates</Text>
      <TextInput
        style={styles.input}
        placeholder="Any certificates"
        placeholderTextColor="#888"
        value={certificates}
        onChangeText={setCertificates}
      />

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <View style={{ height: 200 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
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
  cancelButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    paddingLeft: 10,
    color: "#ffffff",
    backgroundColor: "#1e1e1e",
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
  changePhotoText: {
    color: "#007BFF",
    fontWeight: "bold",
    marginTop: 8,
  },
  cvContainer: {
    marginBottom: 16,
  },
  cvButton: {
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  changeCVText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  cvNameText: {
    color: "#dddddd",
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});