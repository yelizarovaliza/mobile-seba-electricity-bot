import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Button,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  PermissionsAndroid,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import BleManager from "react-native-ble-manager";
import { NativeModules, NativeEventEmitter } from "react-native";
import { useRouter } from "expo-router";
import IconButton from "../components/iconButton";
import { useTheme } from "../context/themeContext";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef1";
const SCAN_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef2";
const CONFIG_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef3";

type BLEDevice = {
  id: string;
  name?: string;
};

export default function BluetoothScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  const [wifiNetworks, setWifiNetworks] = useState<string[]>([]);
  const [selectedSSID, setSelectedSSID] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    BleManager.start({ showAlert: false });

    const handleDiscover = (device: any) => {
      if (device.name?.includes("RaspberryPi_WiFiConfig")) {
        setDevices((prev) =>
          prev.some((d) => d.id === device.id) ? prev : [...prev, device]
        );
      }
    };

    const handleStop = () => setIsScanning(false);

    const discoverSub = bleManagerEmitter.addListener("BleManagerDiscoverPeripheral", handleDiscover);
    const stopSub = bleManagerEmitter.addListener("BleManagerStopScan", handleStop);

    requestPermissions().then(async (granted) => {
      if (granted) {
        await BleManager.enableBluetooth().catch(() =>
          Alert.alert("Bluetooth", "Please enable Bluetooth to proceed.")
        );

        await showBondedDevices();
        startScan();
      }
    });

    return () => {
      discoverSub.remove();
      stopSub.remove();
    };
  }, []);

  async function requestPermissions() {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(val => val === "granted");
    }
    return true;
  }

  const showBondedDevices = async () => {
    try {
      const bonded = await BleManager.getBondedPeripherals();
      const filtered = bonded.filter((d: any) =>
        d.name?.includes("RaspberryPi_WiFiConfig")
      );
      setDevices((prev) => [...prev, ...filtered]);
    } catch (err) {
      console.warn("Bonded devices error:", err);
    }
  };

  const startScan = () => {
    if (isScanning) return;
    setDevices([]);
    setIsScanning(true);
    BleManager.scan([SERVICE_UUID], 10, false).catch((err) =>
      Alert.alert("Scan error", err.message)
    );
  };

  const connectToDevice = async (deviceId: string) => {
    setLoading(true);
    try {
      await BleManager.connect(deviceId);
      setConnectedDeviceId(deviceId);
      await BleManager.retrieveServices(deviceId);

      const characteristic: number[] = await BleManager.read(
        deviceId,
        SERVICE_UUID,
        SCAN_CHAR_UUID
      );

      const base64String = String.fromCharCode(...characteristic);
      const decoded = atob(base64String);
      const networks = decoded.split(",").filter(Boolean);
      setWifiNetworks(networks);
    } catch (e: any) {
      Alert.alert("Connection Error", e.message || "Failed to connect");
    }
    setLoading(false);
  };

  const sendWifiCredentials = async () => {
    if (!connectedDeviceId || !selectedSSID) {
      Alert.alert("Missing Info", "Please select a network and enter password.");
      return;
    }
    setLoading(true);
    try {
      const encoded = btoa(`${selectedSSID},${password}`);
      const bytes = Array.from(new TextEncoder().encode(encoded));

      await BleManager.write(connectedDeviceId, SERVICE_UUID, CONFIG_CHAR_UUID, bytes);
      Alert.alert("Success", "Wi-Fi credentials sent.");
    } catch (e: any) {
      Alert.alert("Send Error", e.message || "Failed to send credentials");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="🏠" onPress={() => router.push("/")} />
        <Button
          title={isScanning ? "Scanning..." : "Refresh"}
          onPress={startScan}
          disabled={isScanning}
          color={theme.accent}
        />
      </View>

      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>🔍 Available BLE Devices:</Text>

        {(isScanning || loading) && <ActivityIndicator size="large" color={theme.accent} />}

        {!isScanning && !loading && devices.length === 0 && (
          <Text style={[styles.noDevices, { color: theme.muted }]}>No devices found</Text>
        )}

        <FlatList
          data={devices}
          keyExtractor={(item: BLEDevice) => item.id}
          renderItem={({ item }: { item: BLEDevice }) => (
            <Button
              title={item.name || "Unnamed Device"}
              onPress={() => connectToDevice(item.id)}
              color={theme.accent}
              disabled={loading}
            />
          )}
        />

        {wifiNetworks.length > 0 && (
          <KeyboardAvoidingView behavior="padding" style={{ marginTop: 20 }}>
            <Text style={[styles.title, { color: theme.text }]}>📶 Select Wi-Fi Network:</Text>
            <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
              {wifiNetworks.map((ssid) => (
                <Button
                  key={ssid}
                  title={ssid}
                  onPress={() => setSelectedSSID(ssid)}
                  color={selectedSSID === ssid ? theme.accent : undefined}
                />
              ))}
            </ScrollView>

            {selectedSSID && (
              <>
                <Text style={[styles.title, { color: theme.text }]}>🔒 Enter Password:</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={theme.muted}
                  secureTextEntry
                />
                <Button
                  title="Send Wi-Fi Credentials"
                  onPress={sendWifiCredentials}
                  color={theme.accent}
                  disabled={loading || password.length === 0}
                />
              </>
            )}
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  noDevices: { textAlign: "center", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});
