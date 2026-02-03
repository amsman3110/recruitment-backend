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

  // States for the form fields
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

  // Fetch profile data to pre-fill form
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

  // Handle photo pick
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

  // Handle CV pick
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

  // Upload photo to backend, returns the saved photo_url
  const uploadPhoto = async () => {
    try {
      const formData = new FormData();
      formData.append("photo", {
        uri: photo,
        type: "image/jpeg",
        name: "profile_photo.jpg",
      });
      const result = await apiPost("/candidates/upload/photo", formData);
      return result.photo_url;
    } catch (error) {
      console.log("Photo upload error:", error);
      return null;
    }
  };

  // Upload CV to backend, returns the saved cv_url
  const uploadCV = async () => {
    try {
      const formData = new FormData();
      formData.append("cv", {
        uri: cvUrl,
        type: "application/pdf",
        name: cvName || "cv_file.pdf",
      });
      const result = await apiPost("/candidates/upload/cv", formData);
      return result.cv_url;
    } catch (error) {
      console.log("CV upload error:", error);
      return null;
    }
  };

  // Handle form submission
  const handleSave = async () => {
    setLoading(true);

    try {
      var savedPhotoUrl = photo;
      var savedCvUrl = cvUrl;

      // Step 1: If photo changed, upload it first
      if (photoChanged) {
        console.log("Uploading photo...");
        var newPhotoUrl = await uploadPhoto();
        if (newPhotoUrl) {
          savedPhotoUrl = newPhotoUrl;
          console.log("Photo uploaded successfully");
        } else {
          Alert.alert("Warning", "Photo upload failed, saving other fields.");
        }
      }

      // Step 2: If CV changed, upload it first
      if (cvChanged) {
        console.log("Uploading CV...");
        var newCvUrl = await uploadCV();
        if (newCvUrl) {
          savedCvUrl = newCvUrl;
          console.log("CV uploaded successfully");
        } else {
          Alert.alert("Warning", "CV upload failed, saving other fields.");
        }
      }

      // Step 3: Save all profile text fields as JSON
      var profileData = {
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

      {/* Photo */}
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

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {/* Job Title */}
      <Text style={styles.label}>Job Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={jobTitle}
        onChangeText={setJobTitle}
      />

      {/* Specialization */}
      <Text style={styles.label}>Specialization</Text>
      <TextInput
        style={styles.input}
        placeholder="Specialization"
        value={specialization}
        onChangeText={setSpecialization}
      />

      {/* Profile Summary */}
      <Text style={styles.label}>Profile Summary</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Profile Summary"
        value={summary}
        onChangeText={setSummary}
        multiline={true}
      />

      {/* CV */}
      <Text style={styles.label}>CV (PDF)</Text>
      <View style={styles.cvContainer}>
        <TouchableOpacity onPress={pickCV} style={styles.cvButton}>
          <Text style={styles.changeCVText}>
            {cvChanged ? "CV Selected ✓" : cvUrl ? "Change CV" : "Upload CV"}
          </Text>
        </TouchableOpacity>
        {cvName && <Text style={styles.cvNameText}>📄 {cvName}</Text>}
      </View>

      {/* Technical Skills */}
      <Text style={styles.label}>Technical Skills (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. React, Node.js, SQL"
        value={technicalSkills.join(", ")}
        onChangeText={(text) =>
          setTechnicalSkills(text.split(",").map((s) => s.trim()).filter(Boolean))
        }
      />

      {/* Soft Skills */}
      <Text style={styles.label}>Soft Skills (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Communication, Teamwork"
        value={softSkills.join(", ")}
        onChangeText={(text) =>
          setSoftSkills(text.split(",").map((s) => s.trim()).filter(Boolean))
        }
      />

      {/* Experience */}
      <Text style={styles.label}>Experience</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Describe your experience"
        value={experience}
        onChangeText={setExperience}
        multiline={true}
      />

      {/* Education */}
      <Text style={styles.label}>Education</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Computer Science, MIT"
        value={education}
        onChangeText={setEducation}
      />

      {/* Courses */}
      <Text style={styles.label}>Courses</Text>
      <TextInput
        style={styles.input}
        placeholder="Any relevant courses"
        value={courses}
        onChangeText={setCourses}
      />

      {/* Certificates */}
      <Text style={styles.label}>Certificates</Text>
      <TextInput
        style={styles.input}
        placeholder="Any certificates"
        value={certificates}
        onChangeText={setCertificates}
      />

      {/* Save Button */}
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
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