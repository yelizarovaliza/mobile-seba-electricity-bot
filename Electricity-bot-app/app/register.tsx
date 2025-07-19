import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { apiRequest } from '../utils/apiClient';

const RegisterDeviceScreen = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const [name, setName] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await apiRequest('/devices/register', 'POST', {
        deviceUuid: uuid,
        name,
      }, { token: authToken! });

      Alert.alert('Success', 'Device registered!');
      router.replace('/user');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not register device.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>Name your device</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.accent, color: theme.text }]}
        placeholder="e.g. Kitchen Lamp"
        placeholderTextColor={theme.muted}
        value={name}
        onChangeText={setName}
      />
      <Button title="Register Device" onPress={handleRegister} color={theme.accent} />
    </View>
  );
};

export default RegisterDeviceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 6, marginBottom: 20 },
});
