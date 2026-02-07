import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CERTIFICATION_SPECIALIZATIONS,
  COUNTRIES,
  COURSE_SPECIALIZATIONS,
  DEGREE_TYPES,
  EDUCATION_SPECIALIZATIONS,
  SOFT_SKILLS,
  TECHNICAL_SKILLS,
  UNIVERSITIES_BY_COUNTRY,
} from "../../constants/profileData";
import { apiGet, apiPost } from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// THEME COLORS
// ============================================
const COLORS = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceLight: "#2A2A2A",
  surfaceLighter: "#333333",
  primary: "#007AFF",
  primaryDark: "#0056b3",
  text: "#ffffff",
  textSecondary: "#cccccc",
  textMuted: "#888888",
  border: "#3D3D3D",
  success: "#34C759",
  error: "#FF3B30",
  inputBg: "#1e1e1e",
};

// ============================================
// EMPTY ENTRY TEMPLATES
// ============================================
const EMPTY_EXPERIENCE = {
  id: "",
  company_name: "",
  job_title: "",
  start_date: "",
  end_date: "",
  description: "",
  is_current: false,
};

const EMPTY_EDUCATION = {
  id: "",
  degree_type: "",
  specialization: "",
  country: "",
  institution: "",
  start_date: "",
  end_date: "",
};

const EMPTY_CERTIFICATION = {
  id: "",
  name: "",
  granting_institution: "",
  granting_date: "",
  specialization: "",
};

const EMPTY_COURSE = {
  id: "",
  name: "",
  specialization: "",
  granting_institution: "",
  granting_date: "",
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

const formatDateForBackend = (date) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const addIdIfMissing = (entry) => ({
  ...entry,
  id: entry.id || generateId(),
});

// ============================================
// AUTOCOMPLETE DROPDOWN COMPONENT (Multi-select)
// ============================================
function AutocompleteDropdown({
  label,
  options = [],
  selectedItems = [],
  onAddItem,
  onRemoveItem,
  maxItems = 20,
  searchPlaceholder = "Search...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOptions((options || []).slice(0, 50));
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = (options || [])
        .filter((option) => option.toLowerCase().includes(query))
        .slice(0, 50);
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options]);

  const handleSelectItem = (item) => {
    if (selectedItems.includes(item)) {
      Alert.alert("Already Added", "This item is already in your list.");
      return;
    }
    if (selectedItems.length >= maxItems) {
      Alert.alert("Limit Reached", `You can only add up to ${maxItems} items.`);
      return;
    }
    onAddItem(item);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      {/* Selected Items */}
      <View style={styles.chipsContainer}>
        {selectedItems.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {item}
            </Text>
            <TouchableOpacity
              style={styles.chipRemove}
              onPress={() => onRemoveItem(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setIsOpen(true)}>
        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.addButtonText}>Add {label.replace("s", "")}</Text>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => {
                const isSelected = selectedItems.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelectItem(item)}
                    disabled={isSelected}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>No results found</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// SINGLE SELECT DROPDOWN COMPONENT
// ============================================
function SingleSelectDropdown({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOptions(options || []);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredOptions(
        (options || []).filter((option) => option.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, options]);

  const handleSelect = (item) => {
    onChange(item);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownTrigger, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text
          style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? COLORS.textMuted : COLORS.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => {
                const isSelected = value === item;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>No options available</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// DATE PICKER COMPONENT
// ============================================
function DatePickerField({ label, value, onChange, placeholder = "Select date" }) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  const handleConfirm = () => {
    onChange(formatDateForBackend(tempDate));
    setShowPicker(false);
  };

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selectedDate) {
        onChange(formatDateForBackend(selectedDate));
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  return (
    <View style={styles.dateContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateTrigger} onPress={() => setShowPicker(true)}>
        <Text style={[styles.dateText, !value && styles.dropdownPlaceholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {Platform.OS === "ios" ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>{label}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                textColor={COLORS.text}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

// ============================================
// SECTION HEADER COMPONENT
// ============================================
function SectionHeader({ title, icon, onAdd, addLabel = "Add" }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {onAdd && (
        <TouchableOpacity style={styles.sectionAddBtn} onPress={onAdd}>
          <Ionicons name="add" size={18} color={COLORS.text} />
          <Text style={styles.sectionAddText}>{addLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// EXPERIENCE ENTRY COMPONENT
// ============================================
function ExperienceEntry({ entry, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.entryCard}>
      <TouchableOpacity style={styles.entryHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.entryHeaderLeft}>
          <View style={styles.entryBadge}>
            <Text style={styles.entryBadgeText}>{index + 1}</Text>
          </View>
          <Text style={styles.entryHeaderTitle} numberOfLines={1}>
            {entry.job_title || entry.company_name || "New Experience"}
          </Text>
        </View>
        <View style={styles.entryHeaderRight}>
          <TouchableOpacity style={styles.entryRemoveBtn} onPress={() => onRemove(entry.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.entryContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company name"
              placeholderTextColor={COLORS.textMuted}
              value={entry.company_name}
              onChangeText={(text) => onUpdate(entry.id, "company_name", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter job title"
              placeholderTextColor={COLORS.textMuted}
              value={entry.job_title}
              onChangeText={(text) => onUpdate(entry.id, "job_title", text)}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateHalf}>
              <DatePickerField
                label="Start Date *"
                value={entry.start_date}
                onChange={(date) => onUpdate(entry.id, "start_date", date)}
              />
            </View>
            <View style={styles.dateHalf}>
              <DatePickerField
                label="End Date"
                value={entry.end_date}
                onChange={(date) => onUpdate(entry.id, "end_date", date)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              onUpdate(entry.id, "is_current", !entry.is_current);
              if (!entry.is_current) {
                onUpdate(entry.id, "end_date", "");
              }
            }}
          >
            <View style={[styles.checkbox, entry.is_current && styles.checkboxChecked]}>
              {entry.is_current && <Ionicons name="checkmark" size={14} color={COLORS.text} />}
            </View>
            <Text style={styles.checkboxLabel}>I currently work here</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your responsibilities..."
              placeholderTextColor={COLORS.textMuted}
              value={entry.description}
              onChangeText={(text) => onUpdate(entry.id, "description", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================
// EDUCATION ENTRY COMPONENT
// ============================================
function EducationEntry({ entry, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);

  const institutions = entry.country
    ? (UNIVERSITIES_BY_COUNTRY && UNIVERSITIES_BY_COUNTRY[entry.country]) || []
    : [];

  return (
    <View style={styles.entryCard}>
      <TouchableOpacity style={styles.entryHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.entryHeaderLeft}>
          <View style={styles.entryBadge}>
            <Text style={styles.entryBadgeText}>{index + 1}</Text>
          </View>
          <Text style={styles.entryHeaderTitle} numberOfLines={1}>
            {entry.degree_type || entry.institution || "New Education"}
          </Text>
        </View>
        <View style={styles.entryHeaderRight}>
          <TouchableOpacity style={styles.entryRemoveBtn} onPress={() => onRemove(entry.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.entryContent}>
          <SingleSelectDropdown
            label="Degree Type *"
            placeholder="Select degree type"
            options={DEGREE_TYPES || []}
            value={entry.degree_type}
            onChange={(value) => onUpdate(entry.id, "degree_type", value)}
          />

          <SingleSelectDropdown
            label="Specialization *"
            placeholder="Select specialization"
            options={EDUCATION_SPECIALIZATIONS || []}
            value={entry.specialization}
            onChange={(value) => onUpdate(entry.id, "specialization", value)}
          />

          <SingleSelectDropdown
            label="Country *"
            placeholder="Select country"
            options={COUNTRIES || []}
            value={entry.country}
            onChange={(value) => {
              onUpdate(entry.id, "country", value);
              onUpdate(entry.id, "institution", "");
            }}
          />

          <SingleSelectDropdown
            label="Institution *"
            placeholder={entry.country ? "Select institution" : "Select country first"}
            options={institutions}
            value={entry.institution}
            onChange={(value) => onUpdate(entry.id, "institution", value)}
            disabled={!entry.country}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateHalf}>
              <DatePickerField
                label="Start Date"
                value={entry.start_date}
                onChange={(date) => onUpdate(entry.id, "start_date", date)}
              />
            </View>
            <View style={styles.dateHalf}>
              <DatePickerField
                label="End Date"
                value={entry.end_date}
                onChange={(date) => onUpdate(entry.id, "end_date", date)}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================
// CERTIFICATION ENTRY COMPONENT
// ============================================
function CertificationEntry({ entry, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.entryCard}>
      <TouchableOpacity style={styles.entryHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.entryHeaderLeft}>
          <View style={styles.entryBadge}>
            <Text style={styles.entryBadgeText}>{index + 1}</Text>
          </View>
          <Text style={styles.entryHeaderTitle} numberOfLines={1}>
            {entry.name || "New Certification"}
          </Text>
        </View>
        <View style={styles.entryHeaderRight}>
          <TouchableOpacity style={styles.entryRemoveBtn} onPress={() => onRemove(entry.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.entryContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Certification Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter certification name"
              placeholderTextColor={COLORS.textMuted}
              value={entry.name}
              onChangeText={(text) => onUpdate(entry.id, "name", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Granting Institution *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter institution name"
              placeholderTextColor={COLORS.textMuted}
              value={entry.granting_institution}
              onChangeText={(text) => onUpdate(entry.id, "granting_institution", text)}
            />
          </View>

          <SingleSelectDropdown
            label="Specialization"
            placeholder="Select specialization"
            options={CERTIFICATION_SPECIALIZATIONS || EDUCATION_SPECIALIZATIONS || []}
            value={entry.specialization}
            onChange={(value) => onUpdate(entry.id, "specialization", value)}
          />

          <DatePickerField
            label="Granting Date *"
            value={entry.granting_date}
            onChange={(date) => onUpdate(entry.id, "granting_date", date)}
          />
        </View>
      )}
    </View>
  );
}

// ============================================
// COURSE ENTRY COMPONENT
// ============================================
function CourseEntry({ entry, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.entryCard}>
      <TouchableOpacity style={styles.entryHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.entryHeaderLeft}>
          <View style={styles.entryBadge}>
            <Text style={styles.entryBadgeText}>{index + 1}</Text>
          </View>
          <Text style={styles.entryHeaderTitle} numberOfLines={1}>
            {entry.name || "New Course"}
          </Text>
        </View>
        <View style={styles.entryHeaderRight}>
          <TouchableOpacity style={styles.entryRemoveBtn} onPress={() => onRemove(entry.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.entryContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter course name"
              placeholderTextColor={COLORS.textMuted}
              value={entry.name}
              onChangeText={(text) => onUpdate(entry.id, "name", text)}
            />
          </View>

          <SingleSelectDropdown
            label="Specialization"
            placeholder="Select specialization"
            options={COURSE_SPECIALIZATIONS || EDUCATION_SPECIALIZATIONS || []}
            value={entry.specialization}
            onChange={(value) => onUpdate(entry.id, "specialization", value)}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Granting Institution *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter institution name"
              placeholderTextColor={COLORS.textMuted}
              value={entry.granting_institution}
              onChangeText={(text) => onUpdate(entry.id, "granting_institution", text)}
            />
          </View>

          <DatePickerField
            label="Completion Date"
            value={entry.granting_date}
            onChange={(date) => onUpdate(entry.id, "granting_date", date)}
          />
        </View>
      )}
    </View>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
function EmptyState({ icon, text, onAdd, buttonText }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={40} color={COLORS.textMuted} />
      <Text style={styles.emptyStateText}>{text}</Text>
      <TouchableOpacity style={styles.emptyStateBtn} onPress={onAdd}>
        <Ionicons name="add" size={18} color={COLORS.primary} />
        <Text style={styles.emptyStateBtnText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function EditProfileScreen() {
  const router = useRouter();

  // Basic profile fields (existing)
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [summary, setSummary] = useState("");
  
  // Photo fields (KEEP EXISTING - DO NOT TOUCH)
  const [photo, setPhoto] = useState(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  
  // CV fields (KEEP EXISTING - DO NOT TOUCH)
  const [cvUrl, setCvUrl] = useState(null);
  const [cvFilename, setCvFilename] = useState(null);
  const [cvUploadedAt, setCvUploadedAt] = useState(null);
  const [cvChanged, setCvChanged] = useState(false);

  // Skills (now with autocomplete)
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);

  // JSONB Array fields (NEW)
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ============================================
  // LOAD PROFILE
  // ============================================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await apiGet("/candidate/profile");
      const data = profile || {};

      // Basic fields
      setName(data.name || "");
      setJobTitle(data.current_job_title || "");
      setSpecialization(data.specialization || "");
      setSummary(data.profile_summary || "");

      // Photo & CV (existing)
      setPhoto(data.photo_url || null);
      setCvUrl(data.cv_url || null);
      setCvFilename(data.cv_filename || null);
      setCvUploadedAt(data.cv_uploaded_at || null);

      // Skills
      setTechnicalSkills(parseArrayField(data.technical_skills));
      setSoftSkills(parseArrayField(data.soft_skills));

      // JSONB Arrays
      setExperiences(parseArrayField(data.experience).map(addIdIfMissing));
      setEducations(parseArrayField(data.education).map(addIdIfMissing));
      setCertifications(parseArrayField(data.certificates).map(addIdIfMissing));
      setCourses(parseArrayField(data.courses).map(addIdIfMissing));

    } catch (error) {
      console.log("Error loading profile:", error);
      Alert.alert("Error", "Could not load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PHOTO PICKER (EXISTING - DO NOT TOUCH)
  // ============================================
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

  // ============================================
  // CV PICKER (EXISTING - DO NOT TOUCH)
  // ============================================
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

  // ============================================
  // URI TO BASE64 (EXISTING - DO NOT TOUCH)
  // ============================================
  const uriToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          const base64 = base64data.split(",")[1];
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

  // ============================================
  // UPLOAD PHOTO (EXISTING - DO NOT TOUCH)
  // ============================================
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

  // ============================================
  // UPLOAD CV (EXISTING - DO NOT TOUCH)
  // ============================================
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
        cv_filename: cvFilename || "Resume.pdf",
      };

      console.log("Uploading CV to backend...");
      const result = await apiPost("/candidates/upload/cv", payload);

      console.log("CV uploaded successfully!");
      console.log("Result:", result);

      setCvUploadedAt(result.cv_uploaded_at);

      return result;
    } catch (error) {
      console.log("CV upload error:", error);
      Alert.alert("CV Upload Failed", "Could not upload CV. Continuing without it.");
      return { cv_url: cvUrl, cv_filename: cvFilename };
    }
  };

  // ============================================
  // SKILLS HANDLERS
  // ============================================
  const addTechnicalSkill = (skill) => {
    setTechnicalSkills((prev) => [...prev, skill]);
  };

  const removeTechnicalSkill = (skill) => {
    setTechnicalSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addSoftSkill = (skill) => {
    setSoftSkills((prev) => [...prev, skill]);
  };

  const removeSoftSkill = (skill) => {
    setSoftSkills((prev) => prev.filter((s) => s !== skill));
  };

  // ============================================
  // EXPERIENCE HANDLERS
  // ============================================
  const addExperience = () => {
    const newEntry = { ...EMPTY_EXPERIENCE, id: generateId() };
    setExperiences((prev) => [...prev, newEntry]);
  };

  const updateExperience = (id, field, value) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (id) => {
    Alert.alert("Remove Experience", "Are you sure you want to remove this experience?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setExperiences((prev) => prev.filter((exp) => exp.id !== id)),
      },
    ]);
  };

  // ============================================
  // EDUCATION HANDLERS
  // ============================================
  const addEducation = () => {
    const newEntry = { ...EMPTY_EDUCATION, id: generateId() };
    setEducations((prev) => [...prev, newEntry]);
  };

  const updateEducation = (id, field, value) => {
    setEducations((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id) => {
    Alert.alert("Remove Education", "Are you sure you want to remove this education?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setEducations((prev) => prev.filter((edu) => edu.id !== id)),
      },
    ]);
  };

  // ============================================
  // CERTIFICATION HANDLERS
  // ============================================
  const addCertification = () => {
    const newEntry = { ...EMPTY_CERTIFICATION, id: generateId() };
    setCertifications((prev) => [...prev, newEntry]);
  };

  const updateCertification = (id, field, value) => {
    setCertifications((prev) =>
      prev.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
  };

  const removeCertification = (id) => {
    Alert.alert("Remove Certification", "Are you sure you want to remove this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setCertifications((prev) => prev.filter((c) => c.id !== id)),
      },
    ]);
  };

  // ============================================
  // COURSE HANDLERS
  // ============================================
  const addCourse = () => {
    const newEntry = { ...EMPTY_COURSE, id: generateId() };
    setCourses((prev) => [...prev, newEntry]);
  };

  const updateCourse = (id, field, value) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === id ? { ...course, [field]: value } : course))
    );
  };

  const removeCourse = (id) => {
    Alert.alert("Remove Course", "Are you sure you want to remove this course?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setCourses((prev) => prev.filter((c) => c.id !== id)),
      },
    ]);
  };

  // ============================================
  // SAVE PROFILE
  // ============================================
  const handleSave = async () => {
    setSaving(true);

    try {
      let savedPhotoUrl = photo;
      let savedCvUrl = cvUrl;
      let savedCvFilename = cvFilename;
      let savedCvUploadedAt = cvUploadedAt;

      // Upload photo if changed (EXISTING LOGIC - DO NOT TOUCH)
      if (photoChanged && photo && !photo.startsWith("data:")) {
        console.log("Photo changed, uploading...");
        const newPhotoUrl = await uploadPhoto();
        if (newPhotoUrl) {
          savedPhotoUrl = newPhotoUrl;
        }
      }

      // Upload CV if changed (EXISTING LOGIC - DO NOT TOUCH)
      if (cvChanged && cvUrl && !cvUrl.startsWith("data:")) {
        console.log("CV changed, uploading...");
        const cvResult = await uploadCV();
        if (cvResult) {
          savedCvUrl = cvResult.cv_url;
          savedCvFilename = cvResult.cv_filename;
          savedCvUploadedAt = cvResult.cv_uploaded_at;
        }
      }

      // Prepare profile data with JSONB arrays
      const profileData = {
        name: name,
        jobTitle: jobTitle,
        specialization: specialization,
        summary: summary,
        photo_url: savedPhotoUrl,
        cv_url: savedCvUrl,
        cv_filename: savedCvFilename,
        cv_uploaded_at: savedCvUploadedAt,
        // Skills as arrays
        technicalSkills: technicalSkills,
        softSkills: softSkills,
        // JSONB arrays (remove temp IDs before sending)
        experience: experiences.map(({ id, ...rest }) => rest),
        education: educations.map(({ id, ...rest }) => rest),
        certificates: certifications.map(({ id, ...rest }) => rest),
        courses: courses.map(({ id, ...rest }) => rest),
      };

      console.log("Saving profile with arrays:", {
        experience_count: experiences.length,
        education_count: educations.length,
        certificates_count: certifications.length,
        courses_count: courses.length,
      });

      await apiPost("/candidate/update-profile", profileData);

      Alert.alert("Success", "Profile updated successfully!");
      router.push("/profile");
    } catch (error) {
      console.log("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================ */}
        {/* PHOTO SECTION (EXISTING - DO NOT TOUCH) */}
        {/* ============================================ */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: photo || "https://via.placeholder.com/120" }}
            style={styles.photo}
          />
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================ */}
        {/* BASIC INFO SECTION */}
        {/* ============================================ */}
        <SectionHeader title="Basic Information" icon="person-outline" />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Job Title"
            placeholderTextColor={COLORS.textMuted}
            value={jobTitle}
            onChangeText={setJobTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialization</Text>
          <TextInput
            style={styles.input}
            placeholder="Specialization"
            placeholderTextColor={COLORS.textMuted}
            value={specialization}
            onChangeText={setSpecialization}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profile Summary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Profile Summary"
            placeholderTextColor={COLORS.textMuted}
            value={summary}
            onChangeText={setSummary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ============================================ */}
        {/* CV SECTION (EXISTING - DO NOT TOUCH) */}
        {/* ============================================ */}
        <View style={styles.inputGroup}>
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
        </View>

        {/* ============================================ */}
        {/* SKILLS SECTION (UPDATED WITH AUTOCOMPLETE) */}
        {/* ============================================ */}
        <View style={styles.sectionDivider} />
        <SectionHeader title="Skills" icon="bulb-outline" />

        <AutocompleteDropdown
          label="Technical Skills"
          options={TECHNICAL_SKILLS || []}
          selectedItems={technicalSkills}
          onAddItem={addTechnicalSkill}
          onRemoveItem={removeTechnicalSkill}
          maxItems={20}
          searchPlaceholder="Search technical skills..."
        />

        <AutocompleteDropdown
          label="Soft Skills"
          options={SOFT_SKILLS || []}
          selectedItems={softSkills}
          onAddItem={addSoftSkill}
          onRemoveItem={removeSoftSkill}
          maxItems={15}
          searchPlaceholder="Search soft skills..."
        />

        {/* ============================================ */}
        {/* EXPERIENCE SECTION */}
        {/* ============================================ */}
        <View style={styles.sectionDivider} />
        <SectionHeader
          title="Work Experience"
          icon="briefcase-outline"
          onAdd={addExperience}
          addLabel="Add"
        />

        {experiences.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            text="No experience added yet"
            onAdd={addExperience}
            buttonText="Add Experience"
          />
        ) : (
          experiences.map((exp, index) => (
            <ExperienceEntry
              key={exp.id}
              entry={exp}
              index={index}
              onUpdate={updateExperience}
              onRemove={removeExperience}
            />
          ))
        )}

        {/* ============================================ */}
        {/* EDUCATION SECTION */}
        {/* ============================================ */}
        <View style={styles.sectionDivider} />
        <SectionHeader
          title="Education"
          icon="school-outline"
          onAdd={addEducation}
          addLabel="Add"
        />

        {educations.length === 0 ? (
          <EmptyState
            icon="school-outline"
            text="No education added yet"
            onAdd={addEducation}
            buttonText="Add Education"
          />
        ) : (
          educations.map((edu, index) => (
            <EducationEntry
              key={edu.id}
              entry={edu}
              index={index}
              onUpdate={updateEducation}
              onRemove={removeEducation}
            />
          ))
        )}

        {/* ============================================ */}
        {/* CERTIFICATIONS SECTION */}
        {/* ============================================ */}
        <View style={styles.sectionDivider} />
        <SectionHeader
          title="Certifications"
          icon="ribbon-outline"
          onAdd={addCertification}
          addLabel="Add"
        />

        {certifications.length === 0 ? (
          <EmptyState
            icon="ribbon-outline"
            text="No certifications added yet"
            onAdd={addCertification}
            buttonText="Add Certification"
          />
        ) : (
          certifications.map((cert, index) => (
            <CertificationEntry
              key={cert.id}
              entry={cert}
              index={index}
              onUpdate={updateCertification}
              onRemove={removeCertification}
            />
          ))
        )}

        {/* ============================================ */}
        {/* COURSES SECTION */}
        {/* ============================================ */}
        <View style={styles.sectionDivider} />
        <SectionHeader
          title="Courses"
          icon="book-outline"
          onAdd={addCourse}
          addLabel="Add"
        />

        {courses.length === 0 ? (
          <EmptyState
            icon="book-outline"
            text="No courses added yet"
            onAdd={addCourse}
            buttonText="Add Course"
          />
        ) : (
          courses.map((course, index) => (
            <CourseEntry
              key={course.id}
              entry={course}
              index={index}
              onUpdate={updateCourse}
              onRemove={removeCourse}
            />
          ))
        )}

        {/* ============================================ */}
        {/* SAVE BUTTON */}
        {/* ============================================ */}
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 16,
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 40,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "bold",
  },
  cancelButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Photo (existing)
  photoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginTop: 8,
  },

  // CV (existing)
  cvContainer: {
    marginBottom: 8,
  },
  cvButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  changeCVText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  cvNameText: {
    color: COLORS.textSecondary,
    marginTop: 6,
  },

  // Section
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sectionAddText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: COLORS.inputBg,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  // Chips
  fieldContainer: {
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: SCREEN_WIDTH - 60,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 14,
    marginRight: 6,
    flexShrink: 1,
  },
  chipRemove: {
    marginLeft: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },

  // Dropdown
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBg,
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    color: COLORS.text,
    fontSize: 16,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: COLORS.textMuted,
  },

  // Date
  dateContainer: {
    flex: 1,
  },
  dateTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBg,
  },
  dateText: {
    color: COLORS.text,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateHalf: {
    flex: 1,
  },
  datePickerModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  datePickerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },
  datePickerCancel: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  datePickerDone: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  datePicker: {
    height: 200,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: COLORS.text,
    fontSize: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: COLORS.surfaceLight,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 16,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  emptyList: {
    padding: 40,
    alignItems: "center",
  },
  emptyListText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },

  // Entry Card
  entryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: COLORS.surfaceLight,
  },
  entryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  entryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  entryBadgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  entryHeaderTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  entryHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  entryRemoveBtn: {
    padding: 4,
  },
  entryContent: {
    padding: 16,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    color: COLORS.text,
    fontSize: 15,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  emptyStateText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyStateBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emptyStateBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },

  // Save Button
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});