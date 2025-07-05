import React, { useEffect, useState } from "react";
import {
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";

export default function GenericListScreen({ navigation, route }) {
  const { entityType } = route.params;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q = collection(firestore, entityType.toLowerCase());
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error fetching snapshot:", error);
        Alert.alert("Error", "Could not load data.");
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [entityType]);

  const onRefresh = () => {
    setRefreshing(true);
    // No manual fetch needed; snapshot listener will auto-update
  };

  const deleteItem = async (id) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, entityType.toLowerCase(), id));
            } catch (error) {
              console.error("Delete failed:", error);
              Alert.alert("Error", "Failed to delete item.");
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (item) => (
    <RectButton
      style={styles.deleteButton}
      onPress={() => deleteItem(item.id)}
    >
      <Ionicons name="trash" size={24} color="white" />
    </RectButton>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate("AddPersonScreen", { entityType, item })}
      >
        <Ionicons
          name="person-outline"
          size={24}
          color="#1E3A8A"
          style={{ marginRight: 10 }}
        />
        <View>
          <Text style={styles.itemTitle}>{item.name || "No Name"}</Text>
          <Text style={styles.itemSubtitle}>
            {item.role || "No Details"}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{entityType}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={{ marginTop: 10 }}>Loading...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onRefresh={onRefresh}
            refreshing={refreshing}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No {entityType.toLowerCase()} found.
              </Text>
            }
          />

          <TouchableOpacity
            style={styles.bottomAddButton}
            onPress={() => navigation.navigate("AddPersonScreen", { entityType })}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.bottomAddButtonText}>
              Add {entityType.slice(0, -1)}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E3A8A",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#64748B",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginVertical: 4,
  },
  bottomAddButton: {
    flexDirection: "row",
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  bottomAddButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
  },
});
