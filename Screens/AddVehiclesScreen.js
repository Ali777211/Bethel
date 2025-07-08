import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { auth, firestore } from "../Managers/FirebaseManager";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function AddVehicleScreen({ route, navigation }) {
  const vehicle = route.params?.vehicle || null;
  const isEdit = !!vehicle;

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [number, setNumber] = useState("");
  const [type, setType] = useState("Car");
  const [uploading, setUploading] = useState(false);

  const vehicleTypes = [
    { label: "Car", value: "Car" },
    { label: "Motorcycle", value: "Bike" },
    { label: "Truck", value: "Truck" },
    { label: "Bus", value: "Bus" },
    { label: "Van", value: "Van" },
    { label: "Other", value: "Other" },
  ];

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make || "");
      setModel(vehicle.model || "");
      setNumber(vehicle.number || "");
      setType(vehicle.type || "Car");
    }
  }, [vehicle]);

  const handleSubmit = async () => {
    if (!make.trim() || !model.trim() || !number.trim()) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    setUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setUploading(false);
        Alert.alert("Error", "User not authenticated.");
        return;
      }

      const vehicleData = {
        make: make.trim(),
        model: model.trim(),
        number: number.trim().toUpperCase(),
        type,
        ownerId: user.uid,
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(doc(firestore, "vehicles", vehicle.id), vehicleData);
        Alert.alert("Success", "Vehicle updated successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await addDoc(collection(firestore, "vehicles"), {
          ...vehicleData,
          createdAt: serverTimestamp(),
        });
        navigation.goBack();
      }
    } catch (err) {
      console.error("Error saving vehicle:", err);
      Alert.alert("Error", "Could not save vehicle.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Vehicle" : "Add Vehicle"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TextInput
          style={styles.input}
          placeholder="Vehicle Make"
          value={make}
          onChangeText={setMake}
        />

        <TextInput
          style={styles.input}
          placeholder="Vehicle Model"
          value={model}
          onChangeText={setModel}
        />

        <TextInput
          style={styles.input}
          placeholder="Number Plate"
          value={number}
          onChangeText={setNumber}
          autoCapitalize="characters"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(value) => setType(value)}
          >
            {vehicleTypes.map((v) => (
              <Picker.Item key={v.value} label={v.label} value={v.value} />
            ))}
          </Picker>
        </View>

        {uploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>
              {isEdit ? "Updating..." : "Adding..."}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isEdit ? "checkmark" : "add"}
              size={20}
              color="#FFF"
            />
            <Text style={styles.buttonText}>
              {isEdit ? "Update Vehicle" : "Add Vehicle"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  scroll: { padding: 20 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#374151",
  },
});
