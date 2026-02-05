import { useRouter } from "expo-router";
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
import { apiGet, apiPost } from "../services/api";

export default function EditCompanyProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState("");
  const [companySummary, setCompanySummary] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");

  const employeeSizeOptions = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  async function loadCompanyProfile() {
    try {
      setLoading(true);
      const data = await apiGet("/company/profile");
      console.log("Company profile:", data);

      // Populate form
      setCompanyName(data.company_name || "");
      setIndustry(data.industry || "");
      setSpecialization(data.specialization || "");
      setNumberOfEmployees(data.number_of_employees || "");
      setCompanySummary(data.company_summary || "");
      setOfficeLocation(data.office_location || "");
      setLocationLat(data.location_lat?.toString() || "");
      setLocationLng(data.location_lng?.toString() || "");

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading company profile:", error);
      
      // If no profile exists yet, that's okay, show empty form
      if (error.message?.includes("not found")) {
        setLoading(false);
      } else {
        Alert.alert("Error", "Failed to load company profile");
        setLoading(false);
      }
    }
  }

  async function handleSave() {
    if (!companyName.trim()) {
      Alert.alert("Error", "Company name is required");
      return;
    }

    try {
      setSubmitting(true);

      const profileData = {
        company_name: companyName.trim(),
        industry: industry.trim() || null,
        specialization: specialization.trim() || null,
        number_of_employees: numberOfEmployees || null,
        company_summary: companySummary.trim() || null,
        office_location: officeLocation.trim() || null,
        location_lat: locationLat ? parseFloat(locationLat) : null,
        location_lng: locationLng ? parseFloat(locationLng) : null,
      };

      console.log("Updating company profile:", profileData);

      await apiPost("/company/profile", profileData);

      Alert.alert("Success", "Company profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);

      setSubmitting(false);
    } catch (error: any) {
      console.error("Error updating company profile:", error);
      Alert.alert("Error", error.message || "Failed to update company profile");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
        <Text style={styles.headerTitle}>Edit Company Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Company Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Company Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Acme Corporation"
            placeholderTextColor="#999"
            value={companyName}
            onChangeText={setCompanyName}
          />
        </View>

        {/* Industry */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Industry</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Technology, Finance, Healthcare"
            placeholderTextColor="#999"
            value={industry}
            onChangeText={setIndustry}
          />
        </View>

        {/* Specialization */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Specialization</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Software Development, Marketing"
            placeholderTextColor="#999"
            value={specialization}
            onChangeText={setSpecialization}
          />
        </View>

        {/* Number of Employees */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Number of Employees</Text>
          <View style={styles.optionsGrid}>
            {employeeSizeOptions.map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.optionButton,
                  numberOfEmployees === size && styles.optionButtonSelected,
                ]}
                onPress={() => setNumberOfEmployees(size)}
              >
                <Text
                  style={[
                    styles.optionText,
                    numberOfEmployees === size && styles.optionTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Company Summary */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Company Summary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell candidates about your company, mission, culture, and what makes you unique..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            value={companySummary}
            onChangeText={setCompanySummary}
          />
        </View>

        {/* Office Location */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Office Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 123 Main St, Cairo, Egypt"
            placeholderTextColor="#999"
            value={officeLocation}
            onChangeText={setOfficeLocation}
          />
        </View>

        {/* Location Coordinates */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location Coordinates (Optional)</Text>
          <Text style={styles.helperText}>
            Add coordinates for map display
          </Text>
          <View style={styles.coordinatesRow}>
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30.0444"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={locationLat}
                onChangeText={setLocationLat}
              />
            </View>
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 31.2357"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={locationLng}
                onChangeText={setLocationLng}
              />
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Profile Tips</Text>
          <Text style={styles.tipText}>
            • A complete profile attracts better candidates
          </Text>
          <Text style={styles.tipText}>
            • Be clear about your company culture and values
          </Text>
          <Text style={styles.tipText}>
            • Add accurate location info to help candidates find you
          </Text>
          <Text style={styles.tipText}>
            • Keep your summary concise but informative
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            disabled={submitting}
          >
            <Text style={styles.saveButtonText}>
              {submitting ? "Saving..." : "Save Profile"}
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
  helperText: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
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
    minHeight: 150,
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
    borderColor: "#34C759",
    backgroundColor: "#F0FFF4",
  },
  optionText: {
    fontSize: 15,
    color: "#666",
  },
  optionTextSelected: {
    color: "#34C759",
    fontWeight: "600",
  },
  coordinatesRow: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  tipsCard: {
    backgroundColor: "#FFF9E6",
    borderWidth: 1,
    borderColor: "#FFD60A",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  saveButton: {
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});