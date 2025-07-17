import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import base64 from 'react-native-base64';
import { BleManager } from 'react-native-ble-plx';
import { useAuth } from '../context/authContext';

const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef1';
const WIFI_CONFIG_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef3';

const ConnectScreen = () => {
  const router = useRouter();
  const { ssid, deviceId } = useLocalSearchParams<{ ssid?: string; deviceId?: string }>();
  const { theme } = useTheme();
  const bleManager = new BleManager();

  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState<string>('Waiting for action...');
  const [loading, setLoading] = useState<boolean>(false);

  const sendCredentials = async () => {
    if (!ssid || !deviceId) {
      Alert.alert('Error', 'Missing SSID or Device ID');
      return;
    }

    setLoading(true);
    setStatus('Sending credentials to device...');

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

      setStatus('Sent. Waiting for device connection...');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to send credentials');
      setStatus('Error while sending');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ssid || !deviceId) return;

    const timeout = setTimeout(() => {
      setStatus('Connected! Redirecting...');
      router.push({ pathname: '/user', params: { uuid: deviceId } });
    }, 8000);

    return () => clearTimeout(timeout);
  }, [ssid, deviceId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text }}>Wi-Fi Network: {ssid}</Text>
      <TextInput
        placeholder="Wi-Fi Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
      />
      <Button title="Connect Device" onPress={sendCredentials} color={theme.accent} disabled={loading || !password} />
      <Text style={{ marginTop: 10, color: theme.text }}>{status}</Text>
      {loading && <ActivityIndicator size="large" color={theme.accent} />}
    </SafeAreaView>
  );
};

export default ConnectScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
});
