import React, { useState, useContext } from "react";
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, firestore } from "../Managers/FirebaseManager";
import { AuthContext } from "../Managers/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userData.uid = user.uid;

        if (userData.createdAt?.toDate) {
          userData.createdAt = userData.createdAt.toDate().toISOString();
        }

        await login(userData);
      } else {
        Alert.alert("Error", "User data not found.");
        await auth.signOut();
      }
    } catch (error) {
      Alert.alert("Login Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container} pointerEvents={loading ? "none" : "auto"}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
        <Text style={styles.link}>Don't have an account? Create one</Text>
      </TouchableOpacity>

      <Modal transparent visible={loading}>
        <View style={styles.modalOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.modalText}>Signing In...</Text>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
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
