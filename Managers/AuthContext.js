import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
