import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../Managers/FirebaseManager";
import * as Updates from "expo-updates";


export default function CitizenHomeScreen({ navigation }) {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUserName(parsed.name);
      }
    };
    loadUser();
  }, []);

  const services = [
    {
      title: "Businesses",
      icon: "briefcase-outline",
      screen: "BusinessesListScreen",
    },
    {
      title: "Hospitals",
      icon: "medkit-outline",
      screen: "HospitalsListScreen",
    },
    {
      title: "Vehicles",
      icon: "car",
      screen: "UserVehiclesListScreen",
    },
  ];

  const handleLogout = async () => {
  try {
    console.log("Hello")
    await auth.signOut();

    await AsyncStorage.removeItem("userData");

    Updates.reloadAsync();
  } catch (error) {
    console.error("Logout error:", error);
    Alert.alert("Error", "Could not log out. Please try again.");
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, {userName}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={styles.serviceItem}
            onPress={() => navigation.navigate(service.screen)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={service.icon} size={24} color="#2563EB" />
            </View>
            <Text style={styles.serviceText}>{service.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2563EB", 
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    padding: 16,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serviceText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
});
