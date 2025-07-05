import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { firestore } from "../Managers/FirebaseManager";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function ManageAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser?.uid) return;

    const q = query(
      collection(firestore, "appointments"),
      where("patientId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCancel = (id) => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          setCanceling(true);
          try {
            await updateDoc(doc(firestore, "appointments", id), {
              status: "cancelled",
            });
            Alert.alert("Cancelled", "Your appointment was cancelled.");
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong.");
          } finally {
            setCanceling(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
        <Text style={styles.status(item.status)}>{item.status}</Text>
      </View>
      <Text style={styles.label}>Patient Email:</Text>
      <Text style={styles.value}>{item.patientEmail}</Text>
      <Text style={styles.label}>Time:</Text>
      <Text style={styles.value}>
        {item.appointmentTime?.toDate().toLocaleString()}
      </Text>
      <Text style={styles.label}>Notes:</Text>
      <Text style={styles.value}>{item.notes || "None"}</Text>
      {item.status === "booked" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id)}
          disabled={canceling}
        >
          <Ionicons name="close-circle" size={18} color="white" />
          <Text style={styles.cancelText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>My Appointments</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No appointments found.</Text>
          }
        />
      )}

      <Modal transparent visible={canceling}>
        <View style={styles.modalOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.modalText}>Cancelling...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  status: (status) => ({
    fontSize: 13,
    fontWeight: "600",
    color:
      status === "booked"
        ? "#16A34A"
        : status === "cancelled"
        ? "#DC2626"
        : "#64748B",
  }),
  label: {
    fontSize: 13,
    color: "#475569",
    marginTop: 6,
  },
  value: {
    fontSize: 14,
    color: "#0F172A",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  cancelText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#64748B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
