import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";

export default function EmployeeManagementScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);

  const route = useRoute();
  const business = route?.params?.business;

  useEffect(() => {
    if (!business?.id) return;

    const employeesRef = collection(firestore, "employees");
    const q = query(employeesRef, where("businessId", "==", business.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setEmployees(list);
    });

    return () => unsubscribe();
  }, [business?.id]);

  const handleDelete = (id, name) => {
    Alert.alert("Delete Employee", `Remove ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(firestore, "employees", id));
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not delete employee.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar || "E"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.role}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.email}>{item.email}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("AddEmployeesScreen", {
              employee: item,
              business,
            })
          }
        >
          <Ionicons name="create-outline" size={16} color="#2563EB" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Employees</Text>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No employees found.</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.bottomButtonWrapper}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddEmployeesScreen", { business })
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Employee</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { marginLeft: 12, fontSize: 18, fontWeight: "600", color: "#1F2937" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: "#2563EB",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "600" },
  name: { fontSize: 16, fontWeight: "600" },
  role: { color: "#6B7280" },
  email: { color: "#374151", marginBottom: 8 },
  actions: { flexDirection: "row" },
  editButton: { flexDirection: "row", alignItems: "center" },
  editText: { color: "#2563EB", marginLeft: 4 },
  bottomButtonWrapper: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#fff", marginLeft: 8, fontWeight: "600", fontSize: 16 },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#6B7280" },
});
