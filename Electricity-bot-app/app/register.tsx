import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();

  const registerDevice = async () => {
    try {
      const result = await fetch("https://your.api/devices/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "USER123", 
          deviceId: "RPi12345", // або connectedDevice.id
          ssid: "MyWiFi", // або з localStorage/params
        }),
      });

      if (result.ok) {
        router.push("/user");
      } else {
        Alert.alert("Помилка", "Не вдалося зареєструвати пристрій");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert("Помилка", errorMessage);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Прив'язати пристрій до акаунту?</Text>
      <Button title="Зареєструвати" onPress={registerDevice} />
    </View>
  );
}
