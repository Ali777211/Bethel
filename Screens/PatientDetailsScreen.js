import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PatientDetailsScreen({ route, navigation }) {
  const { patient } = route.params;
  const [activeTab, setActiveTab] = useState("personal");

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert("No Phone", "No phone number available.");
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      Alert.alert("No Email", "No email address available.");
    }
  };

  const getPatientAge = () => {
    if (patient.age) return `${patient.age} years old`;
    if (patient.dateOfBirth) {
      const birthDate = new Date(patient.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return `${age} years old`;
    }
    return "Age unknown";
  };

  const renderTabButton = (id, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === id && styles.tabButtonActive]}
      onPress={() => setActiveTab(id)}
    >
      <Ionicons
        name={icon}
        size={18}
        color={activeTab === id ? "#2563EB" : "#6B7280"}
      />
      <Text
        style={[
          styles.tabButtonText,
          activeTab === id && styles.tabButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{patient.name || "N/A"}</Text>
        <Text style={styles.label}>Age</Text>
        <Text style={styles.value}>{getPatientAge()}</Text>
        <Text style={styles.label}>Gender</Text>
        <Text style={styles.value}>{patient.gender || "N/A"}</Text>
        <Text style={styles.label}>Blood Type</Text>
        <Text style={styles.value}>{patient.bloodType || "Unknown"}</Text>
      </View>
      <Text style={styles.sectionTitle}>Contact</Text>
      <View style={styles.card}>
        <TouchableOpacity onPress={() => handleCall(patient.phone)}>
          <Text style={styles.contact}>📞 {patient.phone || "No phone"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEmail(patient.email)}>
          <Text style={styles.contact}>✉️ {patient.email || "No email"}</Text>
        </TouchableOpacity>
        <Text style={styles.contact}>📍 {patient.address || "No address"}</Text>
        <TouchableOpacity onPress={() => handleCall(patient.emergencyContact)}>
          <Text style={styles.contact}>
            🚨 {patient.emergencyContact || "No emergency contact"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMedicalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medical Information</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Allergies</Text>
        <Text style={styles.value}>{patient.allergies || "None"}</Text>
        <Text style={styles.label}>Medications</Text>
        <Text style={styles.value}>{patient.medications || "None"}</Text>
        <Text style={styles.label}>Conditions</Text>
        <Text style={styles.value}>{patient.conditions || "None"}</Text>
        <Text style={styles.label}>Insurance</Text>
        <Text style={styles.value}>{patient.insurance || "None"}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patient.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "P"}
            </Text>
          </View>
          <Text style={styles.name}>{patient.name || "Unknown Patient"}</Text>
          <Text style={styles.details}>
            {getPatientAge()} • ID: {patient.id?.slice(-6).toUpperCase()}
          </Text>
        </View>

        <View style={styles.tabs}>
          {renderTabButton("personal", "Personal", "person-outline")}
          {renderTabButton("medical", "Medical", "medkit-outline")}
        </View>

        {activeTab === "personal" ? renderPersonalInfo() : renderMedicalInfo()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
    color: "#1F2937",
  },
  scroll: { padding: 20 },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "white", fontSize: 24, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700", marginTop: 8, color: "#0F172A" },
  details: { color: "#6B7280", fontSize: 14, marginTop: 4 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  tabButtonText: {
    marginLeft: 6,
    color: "#6B7280",
    fontWeight: "600",
  },
  tabButtonTextActive: { color: "#2563EB" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1F2937",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
  },
  contact: {
    fontSize: 15,
    color: "#2563EB",
    marginTop: 8,
  },
});
