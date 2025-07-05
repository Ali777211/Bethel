import React, { useEffect, useState } from "react";
import {
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Alert,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { firestore } from "../Managers/FirebaseManager";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function BusinessesListScreen({ navigation }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUserId(parsed?.uid);
        setUserRole(parsed?.role);
      } else {
        Alert.alert("Error", "User not found. Please log in again.");
      }
    } catch (err) {
      console.error("Error loading user:", err);
      Alert.alert("Error", "Could not load user data.");
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);

    const q =
      userRole === "admin"
        ? query(collection(firestore, "businesses"))
        : query(
            collection(firestore, "businesses"),
            where("ownerId", "==", currentUserId)
          );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(data);
        setLoading(false);
      },
      (err) => {
        console.error("Fetch error:", err);
        Alert.alert("Error", "Could not load businesses.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId, userRole]);

  const deleteBusiness = async (id) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(firestore, "businesses", id));
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "Could not delete business.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderRightActions = (item) => (
    <RectButton
      style={styles.deleteButton}
      onPress={() =>
        Alert.alert(
          "Delete Business",
          `Delete "${item.name}"?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteBusiness(item.id) },
          ]
        )
      }
    >
      {deletingId === item.id ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name="trash-outline" size={20} color="#fff" />
      )}
    </RectButton>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("BusinessRegistrationScreen", { business: item })
        }
      >
        <View style={styles.cardContent}>
          <Ionicons
            name="business-outline"
            size={20}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.type || "Business"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  let screenTitle = userRole === "admin" ? "Businesses" : "My Businesses";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }} // reserve space for button
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text>No businesses found.</Text>
              </View>
            }
          />

          {/* Add New Business Button at Bottom */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("BusinessRegistrationScreen")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add New Business</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  card: {
    backgroundColor: "#eee",
    margin: 10,
    padding: 10,
    borderRadius: 6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 16,
  },
});
