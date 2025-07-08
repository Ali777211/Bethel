import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../Screens/CitizenHomeScreen";
import BusinessesListScreen from "../Screens/BusinessListScreen";
import HospitalsListScreen from "../Screens/HospitalsListScreens";
import UserVehiclesListScreen from "../Screens/UserVehiclesListScreen";
import UsersChecklistScreen from "../Screens/UsersChecklistScreen";
import AdminHomeScreen from "../Screens/AdminHomeScreen";
import AddEmployeeScreen from "../Screens/AddEmployeeScreen";
import AddHospitalScreen from "../Screens/AddHospitalScreen";
import AddVehicleScreen from "../Screens/AddVehiclesScreen";
import AppointmentScreen from "../Screens/AppointmentScreen";
import BusinessDashboardScreen from "../Screens/BusinessDashboardScreen";
import BusinessRegistrationScreen from "../Screens/BusinessRegistrationScreen";
import EmployeeManagementScreen from "../Screens/EmployeeManagementScreen";
import GenericListScreen from "../Screens/GenericListScreen";
import HospitalAdminDashboard from "../Screens/HospitalAdminDashboard";
import HospitalDetailScreen from "../Screens/HospitalDetailScreen";
import ManageAppointmentsScreen from "../Screens/ManageAppointmentsScreen";
import PatientDetailsScreen from "../Screens/PatientDetailsScreen";
import PatientHistory from "../Screens/PatientHistoryScreen";
import AddPersonScreen from "../Screens/AddPersonScreen";
import SettingsScreen from "../Screens/SettingsScreen";

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
      <Stack.Screen
        name="BusinessesListScreen"
        component={BusinessesListScreen}
      />
      <Stack.Screen
        name="HospitalsListScreen"
        component={HospitalsListScreen}
      />
      <Stack.Screen
        name="UserVehiclesListScreen"
        component={UserVehiclesListScreen}
      />
      <Stack.Screen
        name="UsersChecklistScreen"
        component={UsersChecklistScreen}
      />
      <Stack.Screen name="AddEmployeesScreen" component={AddEmployeeScreen} />
      <Stack.Screen name="AddHospitalScreen" component={AddHospitalScreen} />
      <Stack.Screen name="AddVehicleScreen" component={AddVehicleScreen} />
      <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
      <Stack.Screen
        name="BusinessDashboardScreen"
        component={BusinessDashboardScreen}
      />
      <Stack.Screen
        name="BusinessRegistrationScreen"
        component={BusinessRegistrationScreen}
      />
      <Stack.Screen
        name="EmployeeManagementScreen"
        component={EmployeeManagementScreen}
      />
      <Stack.Screen name="GenericListScreen" component={GenericListScreen} />
      <Stack.Screen
        name="HospitalAdminDashboard"
        component={HospitalAdminDashboard}
      />
      <Stack.Screen
        name="HospitalDetailScreen"
        component={HospitalDetailScreen}
      />
      <Stack.Screen
        name="ManageAppointmentsScreen"
        component={ManageAppointmentsScreen}
      />
      <Stack.Screen
        name="PatientDetailsScreen"
        component={PatientDetailsScreen}
      />
      <Stack.Screen name="PatientHistory" component={PatientHistory} />
      <Stack.Screen name="AddPersonScreen" component={AddPersonScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
