import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";

export default function UsersChecklistScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(firestore, "users"),
      where("role", "==", "citizen")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          joinDate: doc.data().createdAt?.toDate() || new Date(),
        }));

        list.sort((a, b) => b.joinDate - a.joinDate);
        setUsers(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to load users.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const deleteUser = async (userId) => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(firestore, "users", userId));
      // No need to manually update users — real-time listener handles it
      Alert.alert("Deleted", "User has been deleted.");
    } catch (error) {
      console.error("Error deleting user:", error);
      Alert.alert("Error", "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Citizen Users</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#555" />
        <TextInput
          placeholder="Search by name or email"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.name || "U")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name || "No Name"}</Text>
                <Text style={styles.email}>{item.email || "No Email"}</Text>
                <Text style={styles.date}>
                  Joined: {item.joinDate.toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Delete User",
                    `Are you sure you want to delete ${item.name}?`,
                    [
                      { text: "Cancel" },
                      { text: "Delete", onPress: () => deleteUser(item.id) },
                    ]
                  )
                }
                style={styles.deleteButton}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Loader Overlay */}
      {(actionLoading || loading) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>
            {loading ? "Loading..." : "Processing..."}
          </Text>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2", padding: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "600", marginLeft: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "600" },
  info: { flex: 1, marginLeft: 10 },
  name: { fontWeight: "600" },
  email: { fontSize: 12, color: "#555" },
  date: { fontSize: 12, color: "#888" },
  deleteButton: {
    backgroundColor: "#e11d48",
    padding: 8,
    borderRadius: 6,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#555",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  overlayText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});
