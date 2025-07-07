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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";
import { Ionicons } from "@expo/vector-icons";

export default function HospitalDetailScreen({ route, navigation }) {
  const { hospital } = route.params;
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user from AsyncStorage
    const fetchUser = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");
        if (jsonValue) {
          setUser(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(firestore, "doctors"), where("hospitalId", "==", hospital.id));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const doctorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching doctors:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [hospital.id]);

  const handleDoctorPress = (doctor) => {
    if (user?.role !== "admin") {
      navigation.navigate("AppointmentScreen", { doctor });
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Hospital Details</Text>
      </View>

      <ScrollView style={{ padding: 10 }}>
        {/* Hospital Info */}
        <View style={styles.card}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.metaText}>Type: {hospital.type}</Text>
          <Text style={styles.metaText}>Location: {hospital.location}</Text>
        </View>

        {/* Doctors Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Doctors ({doctors.length})</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="blue" />
            <Text>Loading doctors...</Text>
          </View>
        ) : doctors.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="medical-outline" size={40} color="gray" />
            <Text>No Doctors Available</Text>
          </View>
        ) : (
          doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={[styles.doctorCard, isAdmin && styles.disabledCard]}
              onPress={() => handleDoctorPress(doctor)}
              disabled={isAdmin}
              activeOpacity={0.8}
            >
              <View style={styles.doctorRow}>
                <Ionicons name="person-circle-outline" size={40} color="#4B5563" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpeciality}>{doctor.role}</Text>
                  <Text style={styles.doctorAvailability}>
                    {doctor.availability || "No availability info"}
                  </Text>
                </View>
              </View>
              {!isAdmin ? (
                <Text style={styles.hint}>Tap to book appointment</Text>
              ) : (
                null
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  metaText: {
    fontSize: 14,
    color: "gray",
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  center: {
    alignItems: "center",
    marginVertical: 20,
  },
  doctorCard: {
    backgroundColor: "#e6e6e6",
    padding: 12,
    marginBottom: 10,
  },
  disabledCard: {
    opacity: 0.6,
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  doctorSpeciality: {
    fontSize: 14,
    color: "gray",
  },
  doctorAvailability: {
    fontSize: 12,
    color: "#1E40AF",
  },
  hint: {
    fontSize: 12,
    color: "blue",
    marginTop: 8,
  },
  adminText: {
    fontSize: 12,
    color: "orange",
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  statBox: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
});
