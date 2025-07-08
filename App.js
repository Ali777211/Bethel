import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import RootNavigation from "./Navigation/RootNavigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./Managers/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <GestureHandlerRootView>
        <RootNavigation />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
