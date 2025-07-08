import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../Managers/AuthContext";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigation() {
  const { user, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator role={user.role} /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
