import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";
import { Ionicons } from "@expo/vector-icons";

export default function HospitalsListScreen({ navigation, route }) {
  // We expect user object from navigation params
  const { user } = route.params || {};
  const isAdmin = user?.role === "admin";

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "hospitals"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHospitals(list);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
        setRefreshing(false);
        Alert.alert("Error", "Could not load hospitals.");
      }
    );

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const deleteHospital = async (id) => {
    Alert.alert(
      "Delete Hospital",
      "Are you sure you want to delete this hospital?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id);
            try {
              await deleteDoc(doc(firestore, "hospitals", id));
              Alert.alert("Deleted", "Hospital deleted successfully.");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete hospital.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderHospital = ({ item }) => (
    <View style={[styles.card, deletingId === item.id && { opacity: 0.5 }]}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
        onPress={() =>
          navigation.navigate("HospitalDetail", { hospital: item, user })
        }
        disabled={!!deletingId}
      >
        <Ionicons name="medkit" size={28} color="#3B82F6" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subtext}>{item.type}</Text>
          <Text style={styles.subtext}>{item.location || "No location"}</Text>
        </View>
      </TouchableOpacity>

      {isAdmin && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteHospital(item.id)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 8 }}>Loading hospitals...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hospitals</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddHospitalScreen", { user })}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {hospitals.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="medkit-outline" size={60} color="#aaa" />
          <Text style={{ marginTop: 12 }}>No hospitals found.</Text>
        </View>
      ) : (
        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.id}
          renderItem={renderHospital}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  addButton: {
    backgroundColor: "#3B82F6",
    padding: 8,
    borderRadius: 6,
  },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: "600" },
  subtext: { fontSize: 12, color: "#555" },
  deleteBtn: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
});
