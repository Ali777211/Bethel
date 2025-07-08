import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, firestore } from "../Managers/FirebaseManager";
import { collection, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function AddHospitalScreen({ navigation }) {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleVerified, setRoleVerified] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed?.role === "admin") {
            setRoleVerified(true);
          } else {
            Alert.alert("Access Denied", "Only admins can register hospitals.");
            navigation.goBack();
          }
        } else {
          Alert.alert("Error", "No user found. Please log in again.");
          navigation.goBack();
        }
      } catch (err) {
        console.error("Error loading user:", err);
        Alert.alert("Error", "Failed to load user data.");
        navigation.goBack();
      }
    };
    checkRole();
  }, []);

  const handleRegister = async () => {
    if (
      !hospitalName ||
      !hospitalType ||
      !hospitalLocation ||
      !adminName ||
      !adminEmail
    ) {
      Alert.alert("Validation", "Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No authenticated user.");
        setLoading(false);
        return;
      }

      const hospitalRef = await addDoc(collection(firestore, "hospitals"), {
        name: hospitalName,
        type: hospitalType,
        location: hospitalLocation,
        adminName,
        adminEmail,
        createdBy: currentUser.uid,
        createdAt: new Date(),
      });

      try {
        const defaultPassword = "admin1234";
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          adminEmail,
          defaultPassword
        );
        const newUser = userCredential.user;
        await setDoc(doc(firestore, "users", newUser.uid), {
          name: adminName,
          email: newUser.email,
          role: "hospitalAdmin",
          hospitalId: hospitalRef.id,
          createdAt: new Date(),
        });
        Alert.alert("Success", "Hospital and admin account created!");
        navigation.goBack();
      } catch (authError) {
        await deleteDoc(hospitalRef);
        Alert.alert(
          "Error",
          "Could not create admin account.\n\n" + authError.message
        );
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  };

  if (!roleVerified) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Hospital</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Registering...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Hospital Name"
            value={hospitalName}
            onChangeText={setHospitalName}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={hospitalType}
              onValueChange={setHospitalType}
              style={styles.picker}
            >
              <Picker.Item label="Select Hospital Type..." value="" />
              <Picker.Item label="General Hospital" value="General Hospital" />
              <Picker.Item label="Clinic" value="Clinic" />
              <Picker.Item label="Cardiac Center" value="Cardiac Center" />
              <Picker.Item
                label="Children's Hospital"
                value="Children's Hospital"
              />
              <Picker.Item label="Eye Hospital" value="Eye Hospital" />
              <Picker.Item
                label="Orthopedic Center"
                value="Orthopedic Center"
              />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Hospital Location"
            value={hospitalLocation}
            onChangeText={setHospitalLocation}
          />

          <TextInput
            style={styles.input}
            placeholder="Admin Name"
            value={adminName}
            onChangeText={setAdminName}
          />

          <TextInput
            style={styles.input}
            placeholder="Admin Email"
            value={adminEmail}
            onChangeText={setAdminEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Register Hospital</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
  },
  headerSpacer: {
    width: 24,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
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
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#fff",
  },
});
