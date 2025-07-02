import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { NativeModules } from "react-native";
import { useTheme } from "../context/themeContext";

const { BluetoothModule } = NativeModules;

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef1";
const WIFI_CONFIG_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef3";

const ConnectScreen = () => {
  const router = useRouter();
  const { ssid, deviceId } = useLocalSearchParams<{ ssid?: string; deviceId?: string }>();
  const { theme } = useTheme();

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Очікування дій...");
  const [loading, setLoading] = useState(false);

  const sendCredentials = async () => {
    if (!ssid || !deviceId) {
      Alert.alert("Помилка", "SSID або Device ID відсутні");
      return;
    }

    setLoading(true);
    setStatus("Надсилаємо дані на пристрій...");

    try {
      const payload = `${ssid},${password}`;
      const bytes = stringToBytes(payload);

      await BluetoothModule.connect(deviceId);
      await BluetoothModule.writeCharacteristic(
        SERVICE_UUID,
        WIFI_CONFIG_CHAR_UUID,
        bytes
      );

      setStatus("Дані надіслані. Очікуємо підключення...");
      setTimeout(() => router.push("/user"), 3000);
    } catch (error) {
      console.error(error);
      Alert.alert("Помилка", "Не вдалося надіслати пароль");
      setStatus("Помилка при відправці");
    } finally {
      setLoading(false);
    }
  };

  const stringToBytes = (str: string): number[] =>
    Array.from(new TextEncoder().encode(str));

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

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
});

export default ConnectScreen;
