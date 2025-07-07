import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function BusinessesListScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log("Failed to load user", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchBusinesses();
      }
    }, [user])
  );

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let q;
      if (user?.role === "admin" || user?.role === "owner") {
        q = query(collection(firestore, "businesses"));
      } else {
        q = query(
          collection(firestore, "businesses"),
          where("ownerId", "==", user.uid)
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBusinesses(data);
    } catch (error) {
      console.log("Error getting businesses:", error);
      Alert.alert("Error", "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this business?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          setDeletingId(id);
          setLoading(true);
          try {
            await deleteDoc(doc(firestore, "businesses", id));
            setBusinesses((prev) => prev.filter((b) => b.id !== id));
          } catch (err) {
            Alert.alert("Error", "Could not delete business");
          } finally {
            setDeletingId(null);
            setLoading(false);
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBusinesses();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const isOwner = user?.uid === item.ownerId;
    const isAdmin = user?.role === "admin";

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.info}>{item.type}</Text>
          <Text style={styles.info}>{item.location}</Text>

          {/* Edit Button - Owner only */}
          {isOwner && (
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() =>
                navigation.navigate("BusinessRegistrationScreen", {
                  business: item,
                })
              }
            >
              <Text style={styles.manageText}>Edit</Text>
            </TouchableOpacity>
          )}

          {/* Manage (Dashboard) - Owner & Admin */}
          {(isOwner || isAdmin) && (
            <TouchableOpacity
              style={[styles.manageBtn, { backgroundColor: "#10B981" }]}
              onPress={() =>
                navigation.navigate("BusinessDashboardScreen", {
                  business: item,
                })
              }
            >
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          )}

          {/* Delete Button - Owner & Admin */}
          {(isOwner || isAdmin) && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteBusiness(item.id)}
            >
              {deletingId === item.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Businesses</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {user?.role === "citizen" && (
        <View style={styles.addNewWrapper}>
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => navigation.navigate("BusinessRegistrationScreen")}
          >
            <Text style={styles.addNewText}>Add New Business</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  cardContent: {
    flexDirection: "column",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    fontSize: 14,
    color: "#333",
  },
  manageBtn: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  manageText: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteBtn: {
    marginTop: 6,
    backgroundColor: "#DC2626",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
  },
  addNewWrapper: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  addNewButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addNewText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
});
