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
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, firestore } from "../Managers/FirebaseManager";

export default function AddPersonScreen({ route, navigation }) {
  const { entityType, item } = route.params || {};

  if (!entityType) {
    Alert.alert("Error", "No entity type provided.");
    return null;
  }

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

  const shiftOptions = ["Morning", "Afternoon", "Evening", "Night"];
  const availabilityByShift = {
    Morning: ["Mon-Fri, 9AM-12PM", "Mon, Wed, Fri, 9AM-11AM"],
    Afternoon: ["Mon-Fri, 12PM-4PM", "Tue, Thu, 1PM-5PM"],
    Evening: ["Mon-Fri, 4PM-8PM"],
    Night: ["Mon-Fri, 8PM-12AM"],
  };
  const doctorRoles = [
    "General Physician",
    "Surgeon",
    "Pediatrician",
    "Dermatologist",
  ];
  const staffRoles = ["Nurse", "Receptionist", "Pharmacist", "Lab Technician"];
  const user = auth.currentUser;

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
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const hospitalId = userDoc.data()?.hospitalId;
      if (!hospitalId) {
        Alert.alert("Error", "Hospital ID not found.");
        setLoading(false);
        return;
      }
      let collectionName = "";
      if (entityType === "Doctors") collectionName = "doctors";
      else if (entityType === "Staff") collectionName = "staff";
      else if (entityType === "Patients") collectionName = "patients";
      else {
        Alert.alert("Error", "Invalid entity type.");
        setLoading(false);
        return;
      }
      const dataToSave = {
        ...form,
        hospitalId,
        updatedAt: serverTimestamp(),
      };
      if (item?.id) {
        await updateDoc(doc(firestore, collectionName, item.id), dataToSave);
        Alert.alert("Success", "Entry updated successfully");
      } else {
        await addDoc(collection(firestore, collectionName), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
        Alert.alert("Success", "Entry created successfully.");
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save entry.");
    }
    setLoading(false);
  };
  console.log("Item",item)

  const disabled = loading;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (!disabled) navigation.goBack();
          }}
          style={styles.backButton}
          disabled={disabled}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {item ? `Update ${entityType.slice(0, -1)}` : `Add ${entityType.slice(0, -1)}`}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!disabled}
      >
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(t) => handleChange("name", t)}
          placeholder="Name"
          editable={!disabled}
        />

        {(entityType === "Doctors" || entityType === "Staff") && (
          <>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={form.role}
                onValueChange={(v) => handleChange("role", v)}
                enabled={!disabled}
              >
                <Picker.Item label="Select Role" value="" />
                {(entityType === "Doctors" ? doctorRoles : staffRoles).map((r) => (
                  <Picker.Item key={r} label={r} value={r} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={form.shift}
                onValueChange={(v) => handleChange("shift", v)}
                enabled={!disabled}
              >
                <Picker.Item label="Select Shift" value="" />
                {shiftOptions.map((s) => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={form.availability}
                onValueChange={(v) => handleChange("availability", v)}
                enabled={!disabled && !!form.shift}
              >
                <Picker.Item label="Select availability" value="" />
                {(availabilityByShift[form.availability] || []).map((avail) => (
                  <Picker.Item key={avail} label={avail} value={avail} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {entityType === "Patients" && (
          <>
            <TextInput
              style={styles.input}
              value={form.age}
              onChangeText={(t) => handleChange("age", t)}
              placeholder="Age"
              keyboardType="numeric"
              editable={!disabled}
            />
            <TextInput
              style={styles.input}
              value={form.gender}
              onChangeText={(t) => handleChange("gender", t)}
              placeholder="Gender"
              editable={!disabled}
            />
            <TextInput
              style={styles.input}
              value={form.bloodGroup}
              onChangeText={(t) => handleChange("bloodGroup", t)}
              placeholder="Blood Group"
              editable={!disabled}
            />
            <TextInput
              style={styles.input}
              value={form.contactNumber}
              onChangeText={(t) => handleChange("contactNumber", t)}
              placeholder="Contact Number"
              keyboardType="phone-pad"
              editable={!disabled}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.address}
              onChangeText={(t) => handleChange("address", t)}
              placeholder="Address"
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
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{item ? "Update" : "Save"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
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
  scroll: { padding: 16 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  pickerBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
