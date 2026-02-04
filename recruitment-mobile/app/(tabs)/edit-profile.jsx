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

export default function EditProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [summary, setSummary] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [cvUrl, setCvUrl] = useState(null);
  const [cvFilename, setCvFilename] = useState(null);
  const [cvUploadedAt, setCvUploadedAt] = useState(null);
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
        setCvFilename(data.cv_filename || null);
        setCvUploadedAt(data.cv_uploaded_at || null);
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
    try {
      console.log("=== CV PICKER START ===");
      
      let result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      console.log("Document picker result:", result);

      if (result.type === "cancel" || result.canceled) {
        console.log("CV picker cancelled");
        return;
      }

      // Handle both old and new DocumentPicker API
      const selectedFile = result.assets ? result.assets[0] : result;
      
      console.log("Selected file:", selectedFile);
      setCvUrl(selectedFile.uri);
      setCvFilename(selectedFile.name);
      setCvChanged(true);
      
      Alert.alert("Success", selectedFile.name + " selected");
    } catch (error) {
      console.log("Error picking CV:", error);
      Alert.alert("Error", "Could not select CV file");
    }
  };

  const uriToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          const base64 = base64data.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log("Error converting to base64:", error);
      throw error;
    }
  };

  const uploadPhoto = async () => {
    try {
      console.log("=== PHOTO UPLOAD START ===");
      console.log("Photo URI:", photo);
      
      console.log("Converting photo to base64...");
      const base64 = await uriToBase64(photo);

      console.log("Base64 conversion complete!");
      console.log("Base64 length:", base64.length);
      
      const payload = { photo_base64: base64 };
      
      console.log("Uploading photo to backend...");
      const result = await apiPost("/candidates/upload/photo", payload);
      
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
      console.log("=== CV UPLOAD START ===");
      console.log("CV URI:", cvUrl);
      console.log("CV Filename:", cvFilename);
      
      console.log("Converting CV to base64...");
      const base64 = await uriToBase64(cvUrl);

      console.log("Base64 conversion complete!");
      console.log("Base64 length:", base64.length);
      
      const payload = { 
        cv_base64: base64,
        cv_filename: cvFilename || "Resume.pdf"
      };
      
      console.log("Uploading CV to backend...");
      const result = await apiPost("/candidates/upload/cv", payload);
      
      console.log("CV uploaded successfully!");
      console.log("Result:", result);
      
      // Update local state with server response
      setCvUploadedAt(result.cv_uploaded_at);
      
      return result;
    } catch (error) {
      console.log("CV upload error:", error);
      Alert.alert("CV Upload Failed", "Could not upload CV. Continuing without it.");
      return { cv_url: cvUrl, cv_filename: cvFilename };
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      let savedPhotoUrl = photo;
      let savedCvUrl = cvUrl;
      let savedCvFilename = cvFilename;
      let savedCvUploadedAt = cvUploadedAt;

      // Upload photo if changed and is a local file
      if (photoChanged && photo && !photo.startsWith("data:")) {
        console.log("Photo changed, uploading...");
        const newPhotoUrl = await uploadPhoto();
        if (newPhotoUrl) {
          savedPhotoUrl = newPhotoUrl;
        }
      }

      // Upload CV if changed and is a local file
      if (cvChanged && cvUrl && !cvUrl.startsWith("data:")) {
        console.log("CV changed, uploading...");
        const cvResult = await uploadCV();
        if (cvResult) {
          savedCvUrl = cvResult.cv_url;
          savedCvFilename = cvResult.cv_filename;
          savedCvUploadedAt = cvResult.cv_uploaded_at;
        }
      }

      const profileData = {
        name: name,
        jobTitle: jobTitle,
        specialization: specialization,
        summary: summary,
        photo_url: savedPhotoUrl,
        cv_url: savedCvUrl,
        cv_filename: savedCvFilename,
        cv_uploaded_at: savedCvUploadedAt,
        technicalSkills: technicalSkills,
        softSkills: softSkills,
        experience: experience,
        education: education,
        courses: courses,
        certificates: certificates,
      };

      console.log("Saving profile with CV metadata:", {
        cv_filename: savedCvFilename,
        cv_uploaded_at: savedCvUploadedAt
      });

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
        {cvFilename && <Text style={styles.cvNameText}>📄 {cvFilename}</Text>}
        {cvUrl && !cvFilename && <Text style={styles.cvNameText}>📄 CV Uploaded</Text>}
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
    marginTop: 40
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