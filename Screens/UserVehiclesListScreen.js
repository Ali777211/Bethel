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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function UserVehiclesListScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser(parsed);
        } else {
          Alert.alert("Error", "No user found. Please log in again.");
        }
      } catch (err) {
        console.error("Error loading user:", err);
        Alert.alert("Error", "Failed to load user.");
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userId = user?.uid || auth.currentUser?.uid;
    const userRole = user?.role;

    let q;
    if (userRole === "admin") {
      q = query(collection(firestore, "vehicles"));
    } else {
      q = query(
        collection(firestore, "vehicles"),
        where("ownerId", "==", userId)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(fetched);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error fetching vehicles:", error);
        Alert.alert("Error", "Could not load vehicles.");
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const deleteVehicle = async (id, vehicleName) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(firestore, "vehicles", id));
      Alert.alert("Deleted", `${vehicleName} has been deleted.`);
    } catch (err) {
      console.error("Delete error:", err.message);
      Alert.alert("Error", "Could not delete vehicle.");
    } finally {
      setDeletingId(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // onSnapshot auto updates
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("AddVehicleScreen", { vehicle: item })}
      style={styles.listItem}
    >
      <View>
        <Text style={styles.itemTitle}>
          {item.make} {item.model}
        </Text>
        <Text style={styles.itemSubtitle}>{item.number}</Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Delete Vehicle",
            `Delete ${item.make} ${item.model}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteVehicle(item.id, `${item.make} ${item.model}`),
              },
            ]
          )
        }
        disabled={deletingId === item.id}
      >
        {deletingId === item.id ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Ionicons name="trash" size={20} color="#cc0000" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={{ marginTop: 8 }}>Loading Vehicles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const userRole = user?.role;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {userRole === "admin" ? "All Vehicles" : "My Vehicles"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: userRole !== "admin" ? 80 : 16,
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: "#555" }}>No vehicles found.</Text>
          </View>
        }
      />

      {/* Add New Vehicle Button */}
      {userRole !== "admin" && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => navigation.navigate("AddVehicleScreen")}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addNewButtonText}>Add New Vehicle</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  addNewButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addNewButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});
