import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../Managers/FirebaseManager";

export default function AddPersonScreen({ route, navigation }) {
  const { entityType, item } = route.params || {};

  if (!entityType) {
    Alert.alert("Error", "No entity type provided.");
    return null;
  }

  const shiftOptions = ["Morning", "Afternoon", "Evening", "Night"];

  const availabilityByShift = {
    Morning: ["Mon-Fri, 9AM-12PM", "Mon, Wed, Fri, 9AM-11AM"],
    Afternoon: ["Mon-Fri, 12PM-4PM", "Tue, Thu, 1PM-5PM"],
    Evening: ["Mon-Fri, 4PM-8PM"],
    Night: ["Mon-Fri, 8PM-12AM"],
  };

  const [form, setForm] = useState({
    name: "",
    role: "",
    shift: "",
    availability: "",
    age: "",
    gender: "",
    bloodGroup: "",
    contactNumber: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("userData");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed.uid);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        role: item.role || "",
        shift: item.shift || "",
        availability: item.availability || "",
        age: item.age || "",
        gender: item.gender || "",
        bloodGroup: item.bloodGroup || "",
        contactNumber: item.contactNumber || "",
        address: item.address || "",
      });
    }
  }, [item]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, availability: "" }));
  }, [form.shift]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(firestore, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      const hospitalId = userDocSnap.data()?.hospitalId;

      if (!hospitalId) {
        Alert.alert("Error", "Hospital ID not found for this user.");
        setLoading(false);
        return;
      }

      let collectionName = "";
      switch (entityType) {
        case "Doctors":
          collectionName = "doctors";
          break;
        case "Staff":
          collectionName = "staff";
          break;
        case "Patients":
          collectionName = "patients";
          break;
        default:
          Alert.alert("Error", "Invalid entity type.");
          setLoading(false);
          return;
      }

      let dataToSave = {
        ...form,
        hospitalId,
        updatedAt: serverTimestamp(),
      };

      if (item && item.id) {
        const docRef = doc(firestore, collectionName, item.id);
        await updateDoc(docRef, dataToSave);
        Alert.alert(
          "Success",
          `${entityType.slice(0, -1)} updated successfully!`
        );
      } else {
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(firestore, collectionName), dataToSave);
        Alert.alert(
          "Success",
          `${entityType.slice(0, -1)} added successfully!`
        );
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving document:", error);
      Alert.alert("Error", "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  const doctorRoles = [
    "General Physician",
    "Surgeon",
    "Pediatrician",
    "Dermatologist",
  ];
  const staffRoles = ["Nurse", "Receptionist", "Pharmacist", "Lab Technician"];
  const disabled = loading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {item
            ? `Update ${entityType.slice(0, -1)}`
            : `Add ${entityType.slice(0, -1)}`}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!loading}
      >
        {(entityType === "Doctors" || entityType === "Staff") && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter name"
              editable={!disabled}
            />

            <Text style={styles.label}>Role</Text>
            <Picker
              selectedValue={form.role}
              onValueChange={(value) => handleChange("role", value)}
              enabled={!disabled}
              style={styles.input}
            >
              <Picker.Item label="Select a role" value="" />
              {(entityType === "Doctors" ? doctorRoles : staffRoles).map(
                (role) => (
                  <Picker.Item key={role} label={role} value={role} />
                )
              )}
            </Picker>

            <Text style={styles.label}>Shift</Text>
            <Picker
              selectedValue={form.shift}
              onValueChange={(value) => handleChange("shift", value)}
              enabled={!disabled}
              style={styles.input}
            >
              <Picker.Item label="Select a shift" value="" />
              {shiftOptions.map((shift) => (
                <Picker.Item key={shift} label={shift} value={shift} />
              ))}
            </Picker>

            <Text style={styles.label}>Availability</Text>
            <Picker
              selectedValue={form.availability}
              onValueChange={(value) => handleChange("availability", value)}
              enabled={!disabled && !!form.shift}
              style={styles.input}
            >
              <Picker.Item label="Select availability" value="" />
              {(availabilityByShift[form.shift] || []).map((avail) => (
                <Picker.Item key={avail} label={avail} value={avail} />
              ))}
            </Picker>
          </>
        )}

        {entityType === "Patients" && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter name"
              editable={!disabled}
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.age}
              onChangeText={(text) => handleChange("age", text)}
              placeholder="Enter age"
              editable={!disabled}
            />

            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={form.gender}
              onChangeText={(text) => handleChange("gender", text)}
              placeholder="Male / Female / Other"
              editable={!disabled}
            />

            <Text style={styles.label}>Blood Group</Text>
            <TextInput
              style={styles.input}
              value={form.bloodGroup}
              onChangeText={(text) => handleChange("bloodGroup", text)}
              placeholder="e.g. O+, A-"
              editable={!disabled}
            />

            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={form.contactNumber}
              onChangeText={(text) => handleChange("contactNumber", text)}
              placeholder="e.g. 1234567890"
              editable={!disabled}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.address}
              onChangeText={(text) => handleChange("address", text)}
              placeholder="Enter address"
              multiline
              editable={!disabled}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, disabled && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={disabled}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{item ? "Update" : "Submit"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#1E293B",
  },
  button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
