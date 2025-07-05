import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  TextInput,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "../Managers/FirebaseManager";
import {
  collection,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { Swipeable } from "react-native-gesture-handler";

export default function UserVehiclesListScreen({ navigation, route }) {
  const { user } = route.params || {};
  const userId = user?.uid || auth.currentUser?.uid;
  const userRole = user?.role;

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let q;
    if (userRole === "admin") {
      q = collection(firestore, "vehicles");
    } else {
      q = query(collection(firestore, "vehicles"), where("ownerId", "==", userId));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        Alert.alert("Error", "Could not load vehicles.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, userRole]);

  useEffect(() => {
    let filtered = vehicles;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (v) =>
          v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (v) => v.type?.toLowerCase() === selectedFilter
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, selectedFilter]);

  const deleteVehicle = async (id) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(firestore, "vehicles", id));
      Alert.alert("Deleted", "Vehicle deleted successfully.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not delete vehicle.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() =>
            Alert.alert("Delete", "Delete this vehicle?", [
              { text: "Cancel" },
              { text: "Delete", onPress: () => deleteVehicle(item.id) },
            ])
          }
        >
          {deletingId === item.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="trash" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      )}
    >
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.make} {item.model}</Text>
          <Text style={styles.sub}>{item.number}</Text>
          <Text style={styles.sub}>{item.type}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddVehicleScreen", { vehicle: item })}
        >
          <Ionicons name="create" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 8 }}>Loading vehicles...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <View style={styles.header}>
        <TextInput
          placeholder="Search..."
          style={styles.search}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          {["all", "car", "motorcycle", "truck"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterBtn,
                selectedFilter === type && styles.filterBtnActive,
              ]}
              onPress={() => setSelectedFilter(type)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === type && { color: "#fff" },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No vehicles found.</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
      />

      {userRole !== "admin" && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddVehicleScreen")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 16, backgroundColor: "#fff" },
  search: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  filterBtnActive: { backgroundColor: "#3B82F6" },
  filterText: { fontSize: 12, color: "#333" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  sub: { fontSize: 12, color: "#666" },
  deleteBtn: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    borderRadius: 8,
    margin: 4,
  },
  addBtn: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#3B82F6",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});
