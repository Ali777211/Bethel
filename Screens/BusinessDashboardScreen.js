import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";

export default function BusinessDashboardScreen({ navigation }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const route = useRoute();
  const businessObj = route?.params?.business;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const dashboardItems = [
    {
      title: "Employees",
      description: "Manage your staff",
      icon: "people",
      onPress: () => navigation.navigate("EmployeesListScreen", { business: businessObj }),
    },
    {
      title: "Payroll",
      description: "Manage payroll and shifts",
      icon: "calendar",
      onPress: () => console.log("Payroll pressed"),
    },
    {
      title: "Performance",
      description: "View performance",
      icon: "analytics",
      onPress: () => console.log("Performance pressed"),
    },
    {
      title: "Reports",
      description: "Generate reports",
      icon: "document-text",
      onPress: () => console.log("Reports pressed"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="business" size={24} color="#fff" />
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.businessName}>{businessObj?.name || "Business"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={28} color="#1E40AF" />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  greeting: { color: "#fff", fontSize: 14 },
  businessName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    color: "#1E293B",
  },
  cardDesc: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4,
    textAlign: "center",
  },
});
