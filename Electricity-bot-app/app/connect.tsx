import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../context/themeContext';
import base64 from 'react-native-base64';
import { BleManager } from 'react-native-ble-plx';

const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef1';
const WIFI_CONFIG_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef3';

const ConnectScreen = () => {
  const router = useRouter();
  const { ssid, deviceId } = useLocalSearchParams<{ ssid?: string; deviceId?: string }>();
  const { theme } = useTheme();
  const bleManager = new BleManager();

  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState<string>('Очікування дій...');
  const [loading, setLoading] = useState<boolean>(false);

  const sendCredentials = async () => {
    if (!ssid || !deviceId) {
      Alert.alert('Помилка', 'SSID або Device ID відсутні');
      return;
    }

    setLoading(true);
    setStatus('Надсилаємо дані на пристрій...');

    try {
      const payload = `${ssid},${password}`;
      const encoded = base64.encode(payload);

      const device = await bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        WIFI_CONFIG_CHAR_UUID,
        encoded
      );

      setStatus('Дані надіслані. Очікуємо підключення...');
      setTimeout(() => {
        router.push({ pathname: '/register', params: { deviceId, ssid } });
      }, 3000);

    } catch (error) {
      console.error(error);
      Alert.alert('Помилка', 'Не вдалося надіслати пароль');
      setStatus('Помилка при відправці');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text }}>Мережа: {ssid}</Text>
      <TextInput
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
      />
      <Button title="Підключити" onPress={sendCredentials} color={theme.accent} />
      <Text style={{ marginTop: 10, color: theme.text }}>{status}</Text>
      {loading && <ActivityIndicator size="large" color={theme.accent} />}
    </View>
  );
};

export default ConnectScreen;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
});
