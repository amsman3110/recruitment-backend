import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    ARAB_COUNTRIES,
    CAREER_LEVELS,
    JOB_CATEGORIES,
    JOB_TYPES,
    WORKPLACE_OPTIONS,
} from "../constants/filterData";
import { apiGet, apiPost } from "../services/api";

export default function JobPostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id;
  const isEditing = !!jobId;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [location, setLocation] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    if (isEditing) {
      loadJob();
    }
  }, []);

  async function loadJob() {
    try {
      setLoading(true);
      const data = await apiGet(`/jobs/${jobId}`);
      console.log("Job data:", data);

      // Populate form
      setTitle(data.title || "");
      setDescription(data.description || "");
      setQualifications(data.qualifications || "");
      setLocation(data.location || "");
      setWorkplace(data.workplace || "");
      setCountry(data.country || "");
      setCity(data.city || "");
      setCareerLevel(data.career_level || "");
      setJobCategory(data.job_category || "");
      setJobType(data.job_type || "");
      setExperienceYears(data.experience_years?.toString() || "");
      setStatus(data.status || "draft");

      setLoading(false);
    } catch (error) {
      console.error("Error loading job:", error);
      Alert.alert("Error", "Failed to load job");
      setLoading(false);
    }
  }

  async function handleSubmit(publishNow: boolean) {
    if (!title.trim()) {
      Alert.alert("Error", "Job title is required");
      return;
    }

    try {
      setSubmitting(true);

      const jobData = {
        title: title.trim(),
        description: description.trim() || null,
        qualifications: qualifications.trim() || null,
        location: location.trim() || null,
        workplace: workplace || null,
        country: country || null,
        city: city || null,
        career_level: careerLevel || null,
        job_category: jobCategory || null,
        job_type: jobType || null,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        status: publishNow ? "open" : "draft",
      };

      console.log("Submitting job:", jobData);

      if (isEditing) {
        // Update existing job
        await apiPost(`/jobs/${jobId}`, jobData);
        Alert.alert(
          "Success",
          publishNow ? "Job published successfully" : "Job updated successfully",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        // Create new job
        await apiPost("/jobs", jobData);
        Alert.alert(
          "Success",
          publishNow ? "Job posted successfully" : "Job saved as draft",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }

      setSubmitting(false);
    } catch (error: any) {
      console.error("Error submitting job:", error);
      Alert.alert("Error", error.message || "Failed to save job");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading job...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Job" : "Post New Job"}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Job Title */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Job Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Senior Software Engineer"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Job Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Qualifications */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Qualifications & Requirements</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="List required skills, experience, education, etc..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={qualifications}
            onChangeText={setQualifications}
          />
        </View>

        {/* Location */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Cairo, Egypt"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Workplace Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Workplace Type</Text>
          <View style={styles.optionsGrid}>
            {WORKPLACE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  workplace === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setWorkplace(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    workplace === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Country */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Country</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {ARAB_COUNTRIES.slice(0, 10).map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.chipButton,
                  country === option.value && styles.chipButtonSelected,
                ]}
                onPress={() => setCountry(option.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    country === option.value && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* City */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Cairo"
            placeholderTextColor="#999"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Career Level */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Career Level</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {CAREER_LEVELS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.chipButton,
                  careerLevel === option.value && styles.chipButtonSelected,
                ]}
                onPress={() => setCareerLevel(option.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    careerLevel === option.value && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Job Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Job Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {JOB_CATEGORIES.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.chipButton,
                  jobCategory === option.value && styles.chipButtonSelected,
                ]}
                onPress={() => setJobCategory(option.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    jobCategory === option.value && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Job Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Job Type</Text>
          <View style={styles.optionsGrid}>
            {JOB_TYPES.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  jobType === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setJobType(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    jobType === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Experience Years */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Required Experience (Years)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 3"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={experienceYears}
            onChangeText={setExperienceYears}
          />
        </View>

        {/* Submit Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={[styles.button, styles.draftButton]}
            onPress={() => handleSubmit(false)}
            disabled={submitting}
          >
            <Text style={styles.draftButtonText}>
              {submitting ? "Saving..." : "Save as Draft"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.publishButton]}
            onPress={() => handleSubmit(true)}
            disabled={submitting}
          >
            <Text style={styles.publishButtonText}>
              {submitting ? "Publishing..." : isEditing ? "Update & Publish" : "Publish Job"}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    flex: 1,
  },
  formGroup: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#fff",
  },
  optionButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FF",
  },
  optionText: {
    fontSize: 15,
    color: "#666",
  },
  optionTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  chipButtonSelected: {
    borderColor: "#34C759",
    backgroundColor: "#F0FFF4",
  },
  chipText: {
    fontSize: 14,
    color: "#666",
  },
  chipTextSelected: {
    color: "#34C759",
    fontWeight: "600",
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  draftButton: {
    backgroundColor: "#E5E5EA",
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  publishButton: {
    backgroundColor: "#34C759",
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});