import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

type AuthContextType = {
  userId: string | null;
  authToken: string | null;
  login: (userId: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  userId: null,
  authToken: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedToken = await SecureStore.getItemAsync("authToken");
        setUserId(storedUserId);
        setAuthToken(storedToken);
      } catch (e) {
        Alert.alert("Помилка", "Не вдалося отримати дані авторизації");
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (id: string, token: string) => {
    await SecureStore.setItemAsync("userId", id);
    await SecureStore.setItemAsync("authToken", token);
    setUserId(id);
    setAuthToken(token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("authToken");
    setUserId(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ userId, authToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
