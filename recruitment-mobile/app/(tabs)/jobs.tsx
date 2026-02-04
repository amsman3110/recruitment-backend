// recruitment-mobile/app/(tabs)/jobs.tsx
// UPDATED Jobs screen with search and filters

// @ts-nocheck
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
  CITIES_BY_COUNTRY,
  DATE_POSTED_OPTIONS,
  JOB_CATEGORIES,
  JOB_TYPES,
  WORKPLACE_OPTIONS,
} from "../../constants/filterData";
import { apiGet } from "../services/api";

export default function JobsScreen() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search
  const [searchText, setSearchText] = useState("");

  // Filters
  const [selectedWorkplace, setSelectedWorkplace] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCareerLevel, setSelectedCareerLevel] = useState("");
  const [selectedJobCategory, setSelectedJobCategory] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedDatePosted, setSelectedDatePosted] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      var params = new URLSearchParams();
      
      if (searchText) params.append("search", searchText);
      if (selectedWorkplace) params.append("workplace", selectedWorkplace);
      if (selectedCountry) params.append("country", selectedCountry);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedCareerLevel) params.append("career_level", selectedCareerLevel);
      if (selectedJobCategory) params.append("job_category", selectedJobCategory);
      if (selectedJobType) params.append("job_type", selectedJobType);
      if (selectedDatePosted && selectedDatePosted !== "all") {
        params.append("date_posted", selectedDatePosted);
      }

      var queryString = params.toString();
      var endpoint = queryString ? "/jobs?" + queryString : "/jobs";

      console.log("Fetching jobs with filters:", endpoint);

      const data = await apiGet(endpoint);
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchJobs();
  }

  function handleApplyFilters() {
    setShowFilters(false);
    fetchJobs();
  }

  async function handleClearFilters() {
    // Clear all filter states
    setSelectedWorkplace("");
    setSelectedCountry("");
    setSelectedCity("");
    setSelectedCareerLevel("");
    setSelectedJobCategory("");
    setSelectedJobType("");
    setSelectedDatePosted("");
    setSearchText("");
    
    // Fetch all jobs without any filters
    try {
      setLoading(true);
      const data = await apiGet("/jobs");
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  function getActiveFiltersCount() {
    var count = 0;
    if (selectedWorkplace) count++;
    if (selectedCountry) count++;
    if (selectedCity) count++;
    if (selectedCareerLevel) count++;
    if (selectedJobCategory) count++;
    if (selectedJobType) count++;
    if (selectedDatePosted) count++;
    return count;
  }

  var availableCities = selectedCountry && CITIES_BY_COUNTRY[selectedCountry] 
    ? CITIES_BY_COUNTRY[selectedCountry] 
    : [];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading jobs…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchJobs} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <Text style={styles.jobCount}>{jobs.length} jobs</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </Pressable>
      </View>

      {/* Filter Button */}
      <View style={styles.filterRow}>
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>
            🎯 Filters {getActiveFiltersCount() > 0 && "(" + getActiveFiltersCount() + ")"}
          </Text>
        </Pressable>

        {getActiveFiltersCount() > 0 && (
          <Pressable style={styles.clearButton} onPress={handleClearFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No jobs found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      ) : (
        <ScrollView style={styles.jobsList} showsVerticalScrollIndicator={false}>
          {jobs.map((job) => (
            <Pressable
              key={job.id}
              onPress={() => router.push("/job-details?id=" + job.id)}
              style={styles.jobCard}
            >
              <Text style={styles.jobTitle}>{job.title}</Text>
              
              {job.company_name && (
                <Text style={styles.companyName}>{job.company_name}</Text>
              )}

              <View style={styles.jobMeta}>
                {job.location && (
                  <Text style={styles.metaTag}>📍 {job.location}</Text>
                )}
                {job.workplace && (
                  <Text style={styles.metaTag}>💼 {job.workplace}</Text>
                )}
                {job.job_type && (
                  <Text style={styles.metaTag}>⏰ {job.job_type}</Text>
                )}
              </View>
            </Pressable>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <Pressable onPress={() => setShowFilters(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Workplace */}
            <FilterSection title="Workplace">
              {WORKPLACE_OPTIONS.map((option) => (
                <FilterOption
                  key={option.value}
                  label={option.label}
                  selected={selectedWorkplace === option.value}
                  onPress={() =>
                    setSelectedWorkplace(
                      selectedWorkplace === option.value ? "" : option.value
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* Country */}
            <FilterSection title="Country">
              {ARAB_COUNTRIES.map((country) => (
                <FilterOption
                  key={country.value}
                  label={country.label}
                  selected={selectedCountry === country.value}
                  onPress={() => {
                    setSelectedCountry(
                      selectedCountry === country.value ? "" : country.value
                    );
                    setSelectedCity(""); // Reset city when country changes
                  }}
                />
              ))}
            </FilterSection>

            {/* City */}
            {availableCities.length > 0 && (
              <FilterSection title="City">
                {availableCities.map((city) => (
                  <FilterOption
                    key={city.value}
                    label={city.label}
                    selected={selectedCity === city.value}
                    onPress={() =>
                      setSelectedCity(
                        selectedCity === city.value ? "" : city.value
                      )
                    }
                  />
                ))}
              </FilterSection>
            )}

            {/* Career Level */}
            <FilterSection title="Career Level">
              {CAREER_LEVELS.map((level) => (
                <FilterOption
                  key={level.value}
                  label={level.label}
                  selected={selectedCareerLevel === level.value}
                  onPress={() =>
                    setSelectedCareerLevel(
                      selectedCareerLevel === level.value ? "" : level.value
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* Job Category */}
            <FilterSection title="Job Category">
              {JOB_CATEGORIES.map((category) => (
                <FilterOption
                  key={category.value}
                  label={category.label}
                  selected={selectedJobCategory === category.value}
                  onPress={() =>
                    setSelectedJobCategory(
                      selectedJobCategory === category.value ? "" : category.value
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* Job Type */}
            <FilterSection title="Job Type">
              {JOB_TYPES.map((type) => (
                <FilterOption
                  key={type.value}
                  label={type.label}
                  selected={selectedJobType === type.value}
                  onPress={() =>
                    setSelectedJobType(
                      selectedJobType === type.value ? "" : type.value
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* Date Posted */}
            <FilterSection title="Date Posted">
              {DATE_POSTED_OPTIONS.map((option) => (
                <FilterOption
                  key={option.value}
                  label={option.label}
                  selected={selectedDatePosted === option.value}
                  onPress={() =>
                    setSelectedDatePosted(
                      selectedDatePosted === option.value ? "" : option.value
                    )
                  }
                />
              ))}
            </FilterSection>

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterSection({ title, children }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FilterOption({ label, selected, onPress }) {
  return (
    <Pressable
      style={[styles.filterOption, selected && styles.filterOptionSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterOptionText,
          selected && styles.filterOptionTextSelected,
        ]}
      >
        {label}
      </Text>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    color: "#B00020",
    fontWeight: "600",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  jobCount: {
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#000",
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 20,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  jobsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  jobCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaTag: {
    fontSize: 13,
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  modalClose: {
    fontSize: 28,
    color: "#000",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: "#007AFF",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#000",
  },
  filterOptionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});