import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import { API_BASE_URL } from '../utils/apiConfig';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { deviceId } = useLocalSearchParams<{ deviceId?: string }>();

  const registerDevice = async () => {
    if (!deviceId || !authToken) {
      Alert.alert('Error', 'Missing device ID or token');
      return;
    }

    try {
      const response = await fetch('${API_BASE_URL}/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ deviceUuid: deviceId }),
      });
        const data = await response.json();
        console.log("Server Response:", data);

      if (response.ok) {
        Alert.alert('Success', 'Device registered');
        router.push('/user');
      } else {
        Alert.alert('Error', 'Device registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: theme.text }}>Register Device?</Text>
      <Button title="Register" onPress={registerDevice} color={theme.accent} />
    </View>
  );
}