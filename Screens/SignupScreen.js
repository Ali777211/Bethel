import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../Managers/FirebaseManager";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await setDoc(doc(firestore, "users", user.uid), {
        name: name.trim(),
        email: user.email,
        role: "citizen",
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("LoginScreen");
    } catch (error) {
      Alert.alert("Signup Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container} pointerEvents={loading ? "none" : "auto"}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>

      <Modal transparent visible={loading}>
        <View style={styles.modalOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.modalText}>Creating Account...</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F0F4FF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  link: {
    color: "#4F46E5",
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
