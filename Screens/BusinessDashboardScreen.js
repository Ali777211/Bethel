import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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
      color: "#3B82F6",
      onPress: () =>
        navigation.navigate("EmployeeManagementScreen", {
          business: businessObj,
        }),
    },
    {
      title: "Payroll",
      description: "Manage payroll and shifts",
      icon: "calendar",
      color: "#F59E0B",
      onPress: () => console.log("Payroll pressed"),
    },
    {
      title: "Performance",
      description: "View performance",
      icon: "analytics",
      color: "#10B981",
      onPress: () => console.log("Performance pressed"),
    },
    {
      title: "Reports",
      description: "Generate reports",
      icon: "document-text",
      color: "#EF4444",
      onPress: () => console.log("Reports pressed"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ccc" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.greetingWrapper}>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <Text style={styles.businessNameText}>
          {businessObj?.name || "Business"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={28} color="#fff" />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  greetingWrapper: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  businessNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: "#f0f0f0",
    marginTop: 2,
    textAlign: "center",
  },
});
