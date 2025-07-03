import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';

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
      const response = await fetch('https://60bf-85-114-193-81.ngrok-free.app/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ deviceUuid: deviceId }),
      });

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