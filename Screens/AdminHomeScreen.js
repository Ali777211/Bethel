import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../Managers/FirebaseManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";


const { width } = Dimensions.get("window");

export default function AdminHomeScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    //   navigation.replace("Login");
    await AsyncStorage.removeItem("userData");
    Updates.reloadAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const adminCards = [
    {
      title: "Users Checklist",
      icon: "people-outline",
      screen: "UsersChecklistScreen",
    },
    {
      title: "Registered Businesses",
      icon: "business-outline",
      screen: "BusinessesListScreen",
    },
    {
      title: "Hospitals",
      icon: "medkit-outline",
      screen: "HospitalsListScreen",
    },
    {
      title: "Registered Vehicles",
      icon: "car-outline",
      screen: "UserVehiclesListScreen",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>City Admin Panel</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {adminCards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(card.screen)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={card.icon} size={36} color="#2563EB" />
            </View>
            <Text style={styles.cardText}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#1E40AF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 6,
  },
  content: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    width: (width - 48) / 2,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: "#DBEAFE",
    padding: 12,
    borderRadius: 50,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: "#1F2937",
    textAlign: "center",
    fontWeight: "500",
  },
});
