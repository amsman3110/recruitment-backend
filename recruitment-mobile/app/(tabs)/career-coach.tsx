// @ts-nocheck
// recruitment-mobile/app/(tabs)/career-coach.tsx
// AI Career Coach Screen

import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { apiPost } from "../services/api";

export default function CareerCoachScreen() {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function analyzeProfile() {
    try {
      setLoading(true);
      setActiveSection("profile");
      setError(null);
      console.log("🤖 Analyzing profile...");
      
      const data = await apiPost("/ai/analyze-profile", {});
      console.log("✅ Profile analysis complete:", data);
      
      setResult(data);
    } catch (error) {
      console.error("❌ Profile analysis error:", error);
      setError("Failed to analyze profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeCV() {
    try {
      setLoading(true);
      setActiveSection("cv");
      setError(null);
      console.log("🤖 Analyzing CV...");
      
      const data = await apiPost("/ai/analyze-cv", {});
      console.log("✅ CV analysis complete:", data);
      
      setResult(data);
    } catch (error) {
      console.error("❌ CV analysis error:", error);
      setError(error.message || "Failed to analyze CV. Please upload a CV first.");
    } finally {
      setLoading(false);
    }
  }

  async function getInterviewPrep() {
    try {
      setLoading(true);
      setActiveSection("interview");
      setError(null);
      console.log("🤖 Generating interview prep...");
      
      const data = await apiPost("/ai/interview-prep", {});
      console.log("✅ Interview prep complete:", data);
      
      setResult(data);
    } catch (error) {
      console.error("❌ Interview prep error:", error);
      setError("Failed to generate interview prep. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearResult() {
    setResult(null);
    setActiveSection(null);
    setError(null);
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Career Coach</Text>
        <Text style={styles.headerSubtitle}>
          Get personalized career advice powered by AI
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Pressable style={styles.errorButton} onPress={clearResult}>
            <Text style={styles.errorButtonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {/* Action Cards */}
      {!result && !error && (
        <View style={styles.cardsContainer}>
          <Pressable
            style={[styles.actionCard, styles.profileCard]}
            onPress={analyzeProfile}
            disabled={loading}
          >
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Analyze My Profile</Text>
            <Text style={styles.cardDescription}>
              Get your profile strength score and personalized improvement tips
            </Text>
            {loading && activeSection === "profile" && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.loadingText}>Analyzing your profile...</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionCard, styles.cvCard]}
            onPress={analyzeCV}
            disabled={loading}
          >
            <Text style={styles.cardIcon}>📄</Text>
            <Text style={styles.cardTitle}>Analyze My CV</Text>
            <Text style={styles.cardDescription}>
              Get expert tips on structure, content, and how to stand out
            </Text>
            {loading && activeSection === "cv" && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.loadingText}>Analyzing your CV...</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionCard, styles.interviewCard]}
            onPress={getInterviewPrep}
            disabled={loading}
          >
            <Text style={styles.cardIcon}>💼</Text>
            <Text style={styles.cardTitle}>Interview Preparation</Text>
            <Text style={styles.cardDescription}>
              Get common questions, STAR method tips, and preparation advice
            </Text>
            {loading && activeSection === "interview" && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.loadingText}>Preparing interview tips...</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}

      {/* Results */}
      {result && !loading && !error && (
        <View style={styles.resultContainer}>
          {/* Profile Analysis Result */}
          {activeSection === "profile" && (
            <>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Profile Strength</Text>
                <Text style={styles.scoreValue}>{result.completeness}%</Text>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      { 
                        width: result.completeness + "%",
                        backgroundColor: result.completeness >= 70 ? "#34C759" : result.completeness >= 40 ? "#FF9500" : "#FF3B30"
                      },
                    ]}
                  />
                </View>
                <Text style={styles.scoreHint}>
                  {result.completeness >= 70 ? "Great profile! 🎉" : result.completeness >= 40 ? "Good start! Keep improving 💪" : "Let's improve your profile 🚀"}
                </Text>
              </View>

              <View style={styles.analysisCard}>
                <Text style={styles.analysisTitle}>📋 AI Analysis & Tips</Text>
                <Text style={styles.analysisText}>{result.analysis}</Text>
              </View>
            </>
          )}

          {/* CV Analysis Result */}
          {activeSection === "cv" && (
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>
                📄 CV Analysis
              </Text>
              {result.cvFilename && (
                <Text style={styles.cvFilename}>File: {result.cvFilename}</Text>
              )}
              <Text style={styles.analysisText}>{result.analysis}</Text>
            </View>
          )}

          {/* Interview Prep Result */}
          {activeSection === "interview" && (
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>
                💼 Interview Preparation
              </Text>
              <Text style={styles.targetRole}>For: {result.targetRole}</Text>
              <Text style={styles.analysisText}>{result.advice}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.backButton} onPress={clearResult}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Info Section */}
      {!result && !loading && !error && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 How It Works</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>1.</Text>
            <Text style={styles.infoText}>
              Choose what you want AI to analyze
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>2.</Text>
            <Text style={styles.infoText}>
              AI reviews your profile, CV, or generates interview tips
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>3.</Text>
            <Text style={styles.infoText}>
              Get personalized, actionable advice instantly
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>4.</Text>
            <Text style={styles.infoText}>
              Improve your profile to match more jobs
            </Text>
          </View>

          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>✨ Powered by Google Gemini AI</Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    lineHeight: 22,
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  errorText: {
    fontSize: 16,
    color: "#C00",
    marginBottom: 12,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  actionCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileCard: {
    backgroundColor: "#007AFF",
  },
  cvCard: {
    backgroundColor: "#34C759",
  },
  interviewCard: {
    backgroundColor: "#FF9500",
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 22,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: "700",
    color: "#007AFF",
  },
  scoreBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E5EA",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 16,
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  scoreHint: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    fontWeight: "600",
  },
  analysisCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  cvFilename: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  targetRole: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 16,
    fontWeight: "600",
  },
  analysisText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoBullet: {
    fontSize: 18,
    color: "#007AFF",
    marginRight: 12,
    fontWeight: "700",
    width: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  infoBadge: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F0F0F5",
    borderRadius: 12,
    alignItems: "center",
  },
  infoBadgeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
});