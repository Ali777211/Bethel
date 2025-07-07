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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";
import { Ionicons } from "@expo/vector-icons";

export default function HospitalsListScreen({ navigation }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Failed to load user from AsyncStorage:", err);
      }
    };

    loadUser();

    let unsubscribe;

    const setupRealTimeListener = () => {
      try {
        const hospitalsRef = collection(firestore, "hospitals");
        unsubscribe = onSnapshot(
          hospitalsRef,
          (snapshot) => {
            const hospitalList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setHospitals(hospitalList);
            setLoading(false);
            setRefreshing(false);
          },
          (error) => {
            console.error("Snapshot error:", error);
            setLoading(false);
            setRefreshing(false);
            Alert.alert(
              "Error",
              "Could not load hospitals. Please try again later."
            );
          }
        );
      } catch (error) {
        console.error("Setup error:", error);
        setLoading(false);
        setRefreshing(false);
      }
    };

    setupRealTimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDelete = async (hospitalId) => {
    setDeleting(true);
    try {
      const usersRef = collection(firestore, "users");
      const adminQuery = query(
        usersRef,
        where("role", "==", "hospitalAdmin"),
        where("hospitalId", "==", hospitalId)
      );
      const adminSnapshot = await getDocs(adminQuery);
      const deletePromises = adminSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(firestore, "users", docSnap.id))
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(firestore, "hospitals", hospitalId));
      setHospitals((prev) => prev.filter((h) => h.id !== hospitalId));
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert(
        "Error",
        "Failed to delete hospital or associated admin. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  const renderHospitalCard = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("HospitalDetailScreen", { hospital: item })
      }
      style={styles.hospitalCard}
      disabled={deleting}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="medkit" size={24} color="#2563EB" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.hospitalName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.hospitalType}>{item.type}</Text>
          <Text style={styles.hospitalLocation} numberOfLines={1}>
            {item.location || "No location"}
          </Text>
        </View>
        {user?.role === "admin" && (
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.inlineDeleteButton}
          >
            <Ionicons name="trash" size={20} color="#e11d48" />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-forward" size={18} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 8, padding: 4 }}
        >
          <Ionicons name="arrow-back" size={20} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospitals</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medkit-outline" size={40} color="#2563EB" />
      <Text style={styles.emptyTitle}>No Hospitals Found</Text>
      <Text style={styles.emptySubtitle}>Add a hospital to get started.</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading hospitals...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      pointerEvents={deleting ? "none" : "auto"}
    >
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      {hospitals.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.id}
          renderItem={renderHospitalCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      {user?.role === "admin" && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddHospitalScreen")}
        >
          <Text style={styles.addButtonText}>Add New Hospital</Text>
        </TouchableOpacity>
      )}

      {deleting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 10 }}>Deleting...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, fontSize: 14, color: "#333" },
  headerContainer: {
    padding: 10,
    backgroundColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#000" },
  listContent: { padding: 10 },
  hospitalCard: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    marginRight: 8,
    backgroundColor: "#ddd",
    padding: 6,
  },
  infoContainer: { flex: 1 },
  hospitalName: { fontSize: 16, fontWeight: "bold", color: "#000" },
  hospitalType: { fontSize: 13, color: "#555" },
  hospitalLocation: { fontSize: 13, color: "#777" },
  inlineDeleteButton: {
    padding: 6,
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    marginTop: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
