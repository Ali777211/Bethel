import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../Managers/FirebaseManager";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";

export default function SettingsScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userString = await AsyncStorage.getItem("userData");
      const userRole = await AsyncStorage.getItem("role");
      if (userString) setUserData(JSON.parse(userString));
      if (userRole) setRole(userRole);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await auth.signOut();
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.clear();
            Updates.reloadAsync();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.header}>Settings</Text>

        {userData && (
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri:
                  userData.photoURL ||
                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userData.name || "User"}</Text>
            <Text style={styles.email}>{userData.email}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ManageAppointmentsScreen")}
        >
          <Text style={styles.buttonText}>Hospital Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("BusinessesListScreen", { showManageButton: true })
          }
        >
          <Text style={styles.buttonText}>My Businesses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("UserVehiclesListScreen")}
        >
          <Text style={styles.buttonText}>My Vehicles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logout]} onPress={handleLogout}>
          <Ionicons name="log-out" size={18} color="#fff" />
          <Text style={[styles.buttonText, { color: "#fff", marginLeft: 8 }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  role: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#E0E0E0",
    padding: 14,
    borderRadius: 4,
    marginBottom: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  logout: {
    backgroundColor: "#D32F2F",
  },
  buttonText: {
    fontSize: 16,
  },
});
