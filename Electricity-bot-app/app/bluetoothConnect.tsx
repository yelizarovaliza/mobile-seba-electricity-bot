import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BleManager } from "react-native-ble-plx";
import base64 from "react-native-base64";
import { useRouter } from "expo-router";
import { useBluetooth } from "../context/bluetoothContext";
import { useTheme } from "../context/themeContext";
import IconButton from "@/components/iconButton";

const manager = new BleManager();
const SERVICE_UUID = "your-service-uuid";
const CHAR_UUID = "your-char-uuid";

export default function BluetoothConnector() {
  const [devices, setDevices] = useState<any[]>([]);
  const router = useRouter();
  const { setConnectedDevice } = useBluetooth();
  const { theme } = useTheme();

  useEffect(() => {
    scanForDevices();
  }, []);

  const scanForDevices = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        return;
      }

      if (device?.name?.includes("Pi")) {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
        manager.stopDeviceScan();
      }
    });
  };

  const connectToDevice = async (device: any) => {
    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);

      // Надіслати user ID
      const payload = base64.encode(JSON.stringify({ id: "USER12345" }));
      await connected.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHAR_UUID,
        payload
      );

      // Отримати список Wi-Fi
      const response = await connected.readCharacteristicForService(
        SERVICE_UUID,
        CHAR_UUID
      );
      const decoded = base64.decode(response.value);
      const wifiList = JSON.parse(decoded);

      router.push({
        pathname: "/connect",
        params: { wifiList: JSON.stringify(wifiList.networks) },
      });
    } catch (error) {
      Alert.alert("Помилка", "Не вдалося підключитись до пристрою");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="🏠" onPress={() => router.push('/')} />
      </View>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>🔍 Сканування Bluetooth пристроїв:</Text>
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Button title={item.name} onPress={() => connectToDevice(item)} color={theme.accent || "#007AFF"} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});