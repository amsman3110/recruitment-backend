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
  const [cvUrl, setCvUrl] = useState(null);
  const [cvName, setCvName] = useState(null);
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
        const response = await apiGet("/candidate/profile");
        const profile = response || {};
        setName(profile.name || "");
        setJobTitle(profile.current_job_title || "");
        setSpecialization(profile.specialization || "");
        setSummary(profile.profile_summary || "");
        setPhoto(profile.photo_url || null);
        setCvUrl(profile.cv_url || null);
        setCvName(profile.cv_name || null);
        setTechnicalSkills(profile.technical_skills || []);
        setSoftSkills(profile.soft_skills || []);
        setExperience(profile.experience || "");
        setEducation(profile.education || "");
        setCourses(profile.courses || "");
        setCertificates(profile.certificates || "");
      } catch (error) {
        console.log("Error loading profile:", error);
        Alert.alert("Error", "Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Handle photo upload
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setPhoto(result.uri);
    }
  };

  // Handle CV upload
  const pickCV = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.type === "success") {
      setCvUrl(result.uri);
      setCvName(result.name);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    setLoading(true);
    
    const formData = new FormData();

    // Add text fields
    formData.append("name", name);
    formData.append("jobTitle", jobTitle);
    formData.append("specialization", specialization);
    formData.append("summary", summary);

    // Add photo if exists
    if (photo) {
      const photoData = {
        uri: photo,
        type: "image/jpeg", // Adjust according to your image type
        name: "profile_photo.jpg",
      };
      formData.append("photo", photoData);
    }

    // Add CV if exists
    if (cvUrl) {
      const cvData = {
        uri: cvUrl,
        type: "application/pdf", // Assuming PDF type for the CV
        name: cvName || "cv_file.pdf",
      };
      formData.append("cv", cvData);
    }

    try {
      await apiPost("/candidate/update-profile", formData);
      Alert.alert("Success", "Profile updated successfully");
      router.push("/profile");
    } catch (error) {
      console.log("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading profile...</Text>;
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
        style={styles.input}
        placeholder="Profile Summary"
        value={summary}
        onChangeText={setSummary}
      />

      {/* CV */}
      <Text style={styles.label}>CV</Text>
      <View style={styles.cvContainer}>
        <TextInput
          style={styles.input}
          placeholder="CV URL"
          value={cvUrl}
          onChangeText={setCvUrl}
        />
        <TouchableOpacity onPress={pickCV}>
          <Text style={styles.changeCVText}>Change CV</Text>
        </TouchableOpacity>
        {cvName && <Text style={styles.cvNameText}>{cvName}</Text>}
      </View>

      {/* Technical Skills */}
      <Text style={styles.label}>Technical Skills</Text>
      <TextInput
        style={styles.input}
        placeholder="Technical Skills"
        value={technicalSkills.join(", ")}
        onChangeText={(text) => setTechnicalSkills(text.split(", "))}
      />

      {/* Soft Skills */}
      <Text style={styles.label}>Soft Skills</Text>
      <TextInput
        style={styles.input}
        placeholder="Soft Skills"
        value={softSkills.join(", ")}
        onChangeText={(text) => setSoftSkills(text.split(", "))}
      />

      {/* Experience */}
      <Text style={styles.label}>Experience</Text>
      <TextInput
        style={styles.input}
        placeholder="Experience"
        value={experience}
        onChangeText={setExperience}
      />

      {/* Education */}
      <Text style={styles.label}>Education</Text>
      <TextInput
        style={styles.input}
        placeholder="Education"
        value={education}
        onChangeText={setEducation}
      />

      {/* Courses */}
      <Text style={styles.label}>Courses</Text>
      <TextInput
        style={styles.input}
        placeholder="Courses"
        value={courses}
        onChangeText={setCourses}
      />

      {/* Certificates */}
      <Text style={styles.label}>Certificates</Text>
      <TextInput
        style={styles.input}
        placeholder="Certificates"
        value={certificates}
        onChangeText={setCertificates}
      />

      {/* Save Button */}
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
    paddingLeft: 8,
    color: "#ffffff",
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
  },
  cvContainer: {
    marginBottom: 20,
  },
  changeCVText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  cvNameText: {
    color: "#dddddd",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
