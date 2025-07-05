import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Common Screens
import HomeScreen from "../Screens/CitizenHomeScreen";
// import SettingsScreen from "../Screens/Settings/SettingsScreen";

// // Admin Screens
// import AdminHomeScreen from "../Screens/Admin/AdminHomeScreen";
// import UsersChecklistScreen from "../Screens/Admin/UsersChecklistScreen";

// // Hospital Admin Screens
// import HospitalAdminDashboard from "../Screens/HospitalAdmin/HospitalAdminDashboard";
// import ManageAppointmentsScreen from "../Screens/Appointments/ManageAppointmentsScreen";

// // Example Business Screens
import BusinessesListScreen from "../Screens/BusinessListScreen";
import HospitalsListScreen from "../Screens/HospitalsListScreens";
import UserVehiclesListScreen from "../Screens/UserVehiclesListScreen";
import UsersChecklistScreen from "../Screens/UsersChecklistScreen";
import AdminHomeScreen from "../Screens/AdminHomeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ role }) {
  let initialRoute = "HomeScreen";
  if (role === "admin") initialRoute = "AdminHomeScreen";
  else if (role === "hospitalAdmin") initialRoute = "HospitalAdminDashboard";

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
      <Stack.Screen name="BusinessesListScreen" component={BusinessesListScreen} />
      <Stack.Screen name="HospitalsListScreen" component={HospitalsListScreen}/>
      <Stack.Screen name="UserVehiclesListScreen" component={UserVehiclesListScreen}/>
      <Stack.Screen name="UsersChecklistScreen" component={UsersChecklistScreen}/>
    </Stack.Navigator>
  );
}
