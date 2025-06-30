import React, { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import base64 from "react-native-base64";
import { useTheme } from "../context/themeContext";

export default function ConnectScreen() {
  const router = useRouter();
  const { ssid, deviceId } = useLocalSearchParams();
  const { theme } = useTheme();

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Очікування дій...");
  const [loading, setLoading] = useState(false);

  // Отримати або передати connectedDevice через props, контекст
  const connectedDevice: any = null;

  const sendCredentials = async () => {
    setLoading(true);
    setStatus("Надсилаємо дані на пристрій...");

    const payload = base64.encode(JSON.stringify({ ssid, password }));

    try {
      if (!connectedDevice) {
        throw new Error("Пристрій не підключено");
      }
      await connectedDevice.writeCharacteristicWithResponseForService(
        "service-uuid",
        "char-uuid",
        payload
      );

      setStatus("Очікуємо підключення до Wi-Fi...");
      setTimeout(() => {
        router.push("/user");
      }, 3000);
    } catch (error) {
      setStatus("Помилка при підключенні");
      Alert.alert("Помилка", "Не вдалося надіслати пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Мережа: {ssid}</Text>
      <TextInput
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
      />
      <Button title="Підключити" onPress={sendCredentials} />
      <Text style={{ marginTop: 10 }}>{status}</Text>
      {loading && <ActivityIndicator size="large" />}
    </View>
  );
}
