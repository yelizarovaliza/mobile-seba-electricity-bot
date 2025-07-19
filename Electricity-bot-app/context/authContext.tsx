import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

type AuthContextType = {
  authToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Завантаження токену з SecureStore
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        setAuthToken(token);
      } catch (err) {
        console.warn('Failed to load auth token:', err);
        Alert.alert('Error', 'Помилка при завантаженні токену');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Збереження токену при логіні
  const login = async (token: string): Promise<boolean> => {
    if (typeof token !== 'string') {
      console.warn('Login failed: token is not a string');
      Alert.alert('Login Error', 'Invalid token received from server.');
      return false;
    }

    try {
      await SecureStore.setItemAsync('authToken', token);
      setAuthToken(token);
      return true;
    } catch (err) {
      console.warn('Login error:', err);
      Alert.alert('Login Error', 'Failed to securely save your session.');
      return false;
    }
  };

  // Видалення токену при виході
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      setAuthToken(null);
    } catch (err) {
      console.warn('Logout error:', err);
      Alert.alert('Error', 'Не вдалося видалити токен');
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
