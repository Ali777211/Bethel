import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { firestore } from "../Managers/FirebaseManager";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

const PatientHistory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { patient } = route.params;

  const [patientRecords, setPatientRecords] = useState([]);

  useEffect(() => {
    const q = query(
      collection(firestore, "appointments"),
      where("patientId", "==", patient.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatientRecords(records);
    });

    return () => unsubscribe();
  }, [patient.id]);

  const handleCancelRecord = (recordId) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            const ref = doc(firestore, "appointments", recordId);
            await updateDoc(ref, { status: "cancelled" });
          },
        },
      ]
    );
  };

  const handleMarkAsCompleted = async (recordId) => {
    const ref = doc(firestore, "appointments", recordId);
    await updateDoc(ref, { status: "completed" });
  };

  const renderRecordItem = ({ item }) => {
    const dateTime = item.appointmentTime
      ? new Date(item.appointmentTime.seconds * 1000)
      : null;

    const date = dateTime ? dateTime.toDateString() : "Not specified";
    const time = dateTime
      ? dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Not specified";

    return (
      <View style={styles.recordCard}>
        <Text style={styles.recordDate}>
          {date} • {time}
        </Text>
        <Text style={styles.recordText}>Doctor: {item.doctorName || "N/A"}</Text>
        <Text style={styles.recordText}>Notes: {item.notes || "No notes"}</Text>
        <Text style={styles.recordText}>
          Status:{" "}
          {item.status === "completed"
            ? "✅ Completed"
            : item.status === "cancelled"
            ? "❌ Cancelled"
            : "🕒 Pending"}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#D4EDDA" }]}
            onPress={() => handleMarkAsCompleted(item.id)}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color="#28A745"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FFEBEB" }]}
            onPress={() => handleCancelRecord(item.id)}
          >
            <Ionicons name="close-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.patientContainer}>
        <View style={styles.patientCard}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientInfo}>
            {patient.age} years • {patient.gender}
          </Text>
          <Text style={styles.patientInfo}>Blood Type: {patient.bloodType}</Text>
          <Text style={styles.patientInfo}>Phone: {patient.phone}</Text>
          <Text style={styles.patientInfo}>Address: {patient.address}</Text>
        </View>
      </ScrollView>

      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Appointments</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate("AddEditHistoryScreen", { patientId: patient.id })
            }
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {patientRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments found.</Text>
          </View>
        ) : (
          <FlatList
            data={patientRecords}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  patientContainer: { maxHeight: 180 },
  patientCard: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 8,
  },
  patientName: { fontSize: 20, fontWeight: "bold", color: "#333" },
  patientInfo: { fontSize: 14, color: "#555", marginTop: 4 },

  historyContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  addButton: {
    backgroundColor: "#4A90E2",
    padding: 8,
    borderRadius: 20,
  },
  listContainer: { padding: 15 },
  recordCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  recordDate: { fontWeight: "bold", color: "#333" },
  recordText: { fontSize: 14, color: "#555", marginTop: 4 },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: { fontSize: 16, color: "#999" },
});

export default PatientHistory;
