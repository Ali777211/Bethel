import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { firestore } from "../Managers/FirebaseManager";
import {
  doc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function BusinessRegistrationScreen({ route, navigation }) {
  const { business = null } = route.params || {};

  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState(business?.name || "");
  const [type, setType] = useState(business?.type || "");
  const [contact, setContact] = useState(business?.contact || "");
  const [location, setLocation] = useState(business?.location || "");
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(!business);
  const [formValid, setFormValid] = useState(false);

  const isEditing = !!business;
  const isOwner = !business || business?.ownerId === currentUser?.uid;

  const businessTypes = [
    { label: "Restaurant", value: "Restaurant" },
    { label: "Retail", value: "Retail" },
    { label: "Salon", value: "Salon" },
    { label: "Technology", value: "Technology" },
    { label: "Consulting", value: "Consulting" },
    { label: "Health", value: "Health" },
    { label: "Education", value: "Education" },
    { label: "Other", value: "Other" },
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
        } else {
          Alert.alert("Error", "User not found. Please log in again.");
          navigation.goBack();
        }
      } catch (err) {
        console.error("Error loading user:", err);
        Alert.alert("Error", "Could not load user data.");
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const valid =
      name.trim() &&
      type &&
      contact.trim() &&
      location.trim() &&
      /^[\d\+\-\s]{6,}$/.test(contact);
    setFormValid(valid);
  }, [name, type, contact, location]);

  const handleSubmit = async () => {
    if (!formValid) {
      return Alert.alert("Invalid", "Please fill out all fields correctly.");
    }

    if (!currentUser?.uid) {
      return Alert.alert("Error", "User not loaded.");
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateDoc(doc(firestore, "businesses", business.id), {
          name,
          type,
          contact,
          location,
        });
        Alert.alert("Success", "Business updated successfully.");
        navigation.goBack();
      } else {
        const q = query(
          collection(firestore, "businesses"),
          where("name", "==", name)
        );
        const existing = await getDocs(q);
        if (!existing.empty) {
          setLoading(false);
          return Alert.alert("Name taken", "Choose a different name.");
        }

        await addDoc(collection(firestore, "businesses"), {
          ownerId: currentUser.uid,
          name,
          type,
          contact,
          location,
          createdAt: new Date(),
        });
        Alert.alert("Success", "Business registered.");
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEditing ? "Business Details" : "Register Business"}
          </Text>
        </View>

        <View style={styles.headerSide}>
          {isEditing && isOwner && !editMode && (
            <TouchableOpacity onPress={() => setEditMode(true)}>
              <Ionicons name="create-outline" size={20} color="#007BFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={name}
              editable={editMode && !loading}
              onChangeText={setName}
            />
            <Picker
              selectedValue={type}
              enabled={editMode && !loading}
              onValueChange={(v) => setType(v)}
              style={styles.picker}
            >
              <Picker.Item label="Select Type" value="" />
              {businessTypes.map((b) => (
                <Picker.Item key={b.value} label={b.label} value={b.value} />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Contact"
              value={contact}
              editable={editMode && !loading}
              onChangeText={setContact}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={location}
              editable={editMode && !loading}
              onChangeText={setLocation}
            />
          </View>

          {editMode && (
            <View>
              <TouchableOpacity
                style={[styles.button, !formValid && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!formValid || loading}
              >
                <Text style={styles.buttonText}>
                  {isEditing ? "Update Business" : "Register Business"}
                </Text>
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditMode(false)}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerSide: {
    width: 40,
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scroll: { padding: 16 },
  inputGroup: { marginBottom: 20 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  picker: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#AAA",
  },
  buttonText: { color: "#FFF", fontWeight: "600" },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: { color: "#555" },
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
