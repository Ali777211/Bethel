import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";
import { Ionicons } from "@expo/vector-icons";

export default function HospitalDetailScreen({ route, navigation }) {
  const { hospital, user } = route.params;

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(firestore, "doctors"),
      where("hospitalId", "==", hospital.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching doctors:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hospital.id]);

  const isAdmin = user?.role === "admin";

  const handleDoctorPress = (doctor) => {
    if (!isAdmin) {
      navigation.navigate("AppointmentScreen", { doctor });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll}>
        {/* Hospital Info */}
        <View style={styles.hospitalBox}>
          <Ionicons name="medkit-outline" size={30} color="#000" />
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.hospitalText}>{hospital.type}</Text>
          <Text style={styles.hospitalText}>{hospital.location}</Text>
        </View>

        {/* Doctors */}
        <Text style={styles.sectionTitle}>Available Doctors</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading doctors...</Text>
          </View>
        ) : doctors.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="medical-outline" size={40} color="#999" />
            <Text style={styles.emptyText}>No doctors available</Text>
          </View>
        ) : (
          <View>
            {doctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                onPress={() => handleDoctorPress(doctor)}
                disabled={isAdmin}
                style={[
                  styles.doctorBox,
                  isAdmin && { opacity: 0.6 },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#000"
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorRole}>{doctor.role}</Text>
                  <Text style={styles.doctorInfo}>
                    {doctor.availability || "No availability info"}
                  </Text>
                </View>
                {isAdmin && (
                  <Text style={styles.adminLabel}>Admin</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  scroll: { padding: 12 },
  hospitalBox: {
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 20,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 6,
    color: "#000",
  },
  hospitalText: { fontSize: 14, color: "#333", marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  center: { alignItems: "center", paddingVertical: 20 },
  loadingText: { marginTop: 6, color: "#333" },
  emptyText: { marginTop: 6, color: "#333" },
  doctorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 10,
  },
  doctorName: { fontSize: 15, fontWeight: "bold", color: "#000" },
  doctorRole: { fontSize: 13, color: "#555" },
  doctorInfo: { fontSize: 12, color: "#777" },
  adminLabel: {
    fontSize: 11,
    color: "#D97706",
    marginLeft: 6,
  },
});
