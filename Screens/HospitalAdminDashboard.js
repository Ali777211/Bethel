import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, firestore } from "../Managers/FirebaseManager";
import { AuthContext } from "../Managers/AuthContext";

const HospitalAdminDashboard = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const [userData, setUserData] = useState(null);
  const [hospitalName, setHospitalName] = useState("Hospital");
  const [loading, setLoading] = useState(true);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.role === "hospitalAdmin") {
            setUserData(parsed);
          } else {
            Alert.alert(
              "Access Denied",
              "You are not authorized to access this dashboard."
            );
            navigation.goBack();
          }
        } else {
          Alert.alert("Error", "User not found. Please log in again.");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        Alert.alert("Error", "Failed to load user data.");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (!userData?.hospitalId) return;

    const fetchHospitalName = async () => {
      try {
        const hospitalDoc = await getDoc(
          doc(firestore, "hospitals", userData.hospitalId)
        );
        if (hospitalDoc.exists()) {
          setHospitalName(hospitalDoc.data().name || "Hospital");
        }
      } catch (error) {
        console.error("Error fetching hospital name:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalName();
  }, [userData]);

  useEffect(() => {
    if (!userData?.hospitalId) return;

    const watchCollection = (collectionName, setCount) => {
      const q = query(
        collection(firestore, collectionName),
        where("hospitalId", "==", userData.hospitalId)
      );

      return onSnapshot(q, (snapshot) => setCount(snapshot.size));
    };

    const unsubDoctors = watchCollection("doctors", setDoctorsCount);
    const unsubStaff = watchCollection("staff", setStaffCount);
    const unsubPatients = watchCollection("patients", setPatientsCount);

    return () => {
      unsubDoctors();
      unsubStaff();
      unsubPatients();
    };
  }, [userData]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      title: "Manage Doctors",
      icon: "medkit-outline",
      count: doctorsCount,
      onPress: () =>
        navigation.navigate("GenericListScreen", { entityType: "Doctors" }),
    },
    {
      title: "Manage Staff",
      icon: "people-outline",
      count: staffCount,
      onPress: () =>
        navigation.navigate("GenericListScreen", { entityType: "Staff" }),
    },
    {
      title: "View Patients",
      icon: "person-outline",
      count: patientsCount,
      onPress: () =>
        navigation.navigate("GenericListScreen", { entityType: "Patients" }),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hi, {userData.name || "Admin"}</Text>
          <Text style={styles.hospital}>{hospitalName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#1e40af" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Doctors" count={doctorsCount} />
        <StatCard label="Staff" count={staffCount} />
        <StatCard label="Patients" count={patientsCount} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <ScrollView contentContainerStyle={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={24} color="#1e40af" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuCount}>{item.count} total</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ label, count }) => (
  <View style={styles.statCard}>
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  hospital: {
    fontSize: 14,
    color: "#64748b",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#1e40af",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  statCount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e40af",
  },
  statLabel: {
    fontSize: 14,
    color: "#475569",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 24,
    marginBottom: 12,
  },
  menuList: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#e0e7ff",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  menuCount: {
    fontSize: 13,
    color: "#64748b",
  },
});

export default HospitalAdminDashboard;
