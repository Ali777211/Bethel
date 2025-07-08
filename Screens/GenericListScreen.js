import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Platform,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";

export default function GenericListScreen({ navigation, route }) {
  const { entityType } = route.params;

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setUserRole(parsed?.role || null);
    } catch (error) {
      console.error("Error reading user data from AsyncStorage:", error);
    }
  };

  const fetchItems = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (userRole !== "admin" && !user.hospitalId) {
      Alert.alert("Error", "Your user profile is missing hospitalId.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let q = collection(firestore, entityType.toLowerCase());
      if (userRole !== "admin") {
        q = query(q, where("hospitalId", "==", user.hospitalId));
      }
      const querySnapshot = await getDocs(q);
      const fetchedItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchItems();
    }
  }, [userRole, entityType]);

  useFocusEffect(
    useCallback(() => {
      if (userRole) fetchItems();
    }, [userRole, entityType])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  }, [userRole, entityType]);

  const deleteItem = async (id) => {
    setDeletingId(id);
    setActionInProgress(true);
    try {
      await deleteDoc(doc(firestore, entityType.toLowerCase(), id));
      setItems((prev) => prev.filter((item) => item.id !== id));
      Alert.alert(
        "Success",
        `${entityType.slice(0, -1)} deleted successfully.`
      );
    } catch (error) {
      console.error("Delete failed:", error);
      Alert.alert("Error", "Failed to delete item.");
    }
    setDeletingId(null);
    setActionInProgress(false);
  };

  const renderRightActions = (item) => (
    <View style={styles.swipeContainer}>
      <RectButton
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            `Delete ${entityType.slice(0, -1)}`,
            `Are you sure you want to permanently delete this ${entityType
              .slice(0, -1)
              .toLowerCase()}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteItem(item.id),
              },
            ]
          )
        }
        disabled={actionInProgress}
      >
        {deletingId === item.id ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Ionicons name="trash" size={24} color="#FFF" />
            <Text style={styles.deleteText}>Delete</Text>
          </>
        )}
      </RectButton>
    </View>
  );

  const renderRegularCard = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <View style={styles.itemCard}>
        <TouchableOpacity
          style={styles.inlineCard}
          onPress={() =>
            navigation.navigate("AddPersonScreen", {
              entityType,
              item,
            })
          }
        >
          <Ionicons name="person-outline" size={24} color="#1E3A8A" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.inlineTitle}>{item.name || "Unnamed"}</Text>
            <Text style={styles.inlineSubtitle}>
              {item.specialty || item.role || entityType.slice(0, -1)}
            </Text>
            <Text style={styles.inlineDescription}>
              {item.details || "No details provided"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{entityType}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading {entityType}...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderRegularCard}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No {entityType} found.</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          />

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.bottomAddButton}
              onPress={() =>
                navigation.navigate("AddPersonScreen", { entityType })
              }
              disabled={actionInProgress}
            >
              <Text style={styles.bottomAddButtonText}>
                + Add {entityType.slice(0, -1)}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748B" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#999" },
  itemCard: { marginBottom: 12 },
  inlineCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inlineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  inlineSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  inlineDescription: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  swipeContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 100,
    borderRadius: 12,
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  bottomButtonContainer: {
    paddingHorizontal: 24,
    marginBottom: Platform.OS === "ios" ? 30 : 20,
  },
  bottomAddButton: {
    backgroundColor: "#1E3A8A",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  bottomAddButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
