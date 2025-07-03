import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, FlatList, Alert, ActivityIndicator, TextInput, PermissionsAndroid, Platform, ScrollView, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { useRouter } from 'expo-router';
import base64 from 'react-native-base64';
import IconButton from '../components/iconButton';
import { useTheme } from '../context/themeContext';

const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef1';
const SCAN_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef2';
const CONFIG_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef3';

const BluetoothScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const bleManager = new BleManager();

  const [devices, setDevices] = useState<{ id: string; name?: string }[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [wifiNetworks, setWifiNetworks] = useState<string[]>([]);
  const [selectedSSID, setSelectedSSID] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const allGranted = Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);

      if (!allGranted) {
        Alert.alert('Permissions Required', 'Please grant all permissions to use Bluetooth.');
        return false;
      }
    }
    return true;
  };

  const startScan = async () => {
    const permissionOk = await requestPermissions();
    if (!permissionOk || isScanning) return;

    Alert.alert('Bluetooth Required', 'Please ensure Bluetooth is turned on before scanning.');

    setDevices([]);
    setIsScanning(true);

    bleManager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
      if (error) {
        Alert.alert('Scan Error', error.message);
        setIsScanning(false);
        return;
      }

      if (device?.name?.includes('RaspberryPi_WiFiConfig')) {
        setDevices(prev => prev.some(d => d.id === device.id) ? prev : [...prev, { id: device.id, name: device.name ?? undefined }]);
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const connectToDevice = async (deviceId: string) => {
    setLoading(true);
    try {
      const device = await bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      setConnectedDevice(device);

      const characteristic = await device.readCharacteristicForService(SERVICE_UUID, SCAN_CHAR_UUID);
      const value = characteristic?.value ? base64.decode(characteristic.value) : '';
      const networks = value.split(',').filter(Boolean);
      setWifiNetworks(networks);
    } catch (e: any) {
      Alert.alert('Connection Error', e.message || 'Failed to connect');
    }
    setLoading(false);
  };

  const sendWifiCredentials = async () => {
    if (!connectedDevice || !selectedSSID) {
      Alert.alert('Missing Info', 'Please select a network and enter password.');
      return;
    }

    setLoading(true);
    try {
      const encoded = base64.encode(`${selectedSSID},${password}`);
      await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, CONFIG_CHAR_UUID, encoded);
      Alert.alert('Success', 'Wi-Fi credentials sent.');
      router.push({ pathname: '/register', params: { deviceId: connectedDevice.id, ssid: selectedSSID } });
    } catch (e: any) {
      Alert.alert('Send Error', e.message || 'Failed to send credentials');
    }
    setLoading(false);
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      bleManager.destroy();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="🏠" onPress={() => router.push('/')} />
        <Button title={isScanning ? 'Scanning...' : 'Refresh'} onPress={startScan} disabled={isScanning} color={theme.accent} />
      </View>

      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>🔍 Available BLE Devices:</Text>

        {isScanning || loading ? <ActivityIndicator size="large" color={theme.accent} /> : null}

        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Button title={item.name || 'Unnamed Device'} onPress={() => connectToDevice(item.id)} disabled={loading} color={theme.accent} />
          )}
        />

        {wifiNetworks.length > 0 && (
          <KeyboardAvoidingView behavior="padding" style={{ marginTop: 20 }}>
            <Text style={[styles.title, { color: theme.text }]}>📶 Select Wi-Fi Network:</Text>
            <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
              {wifiNetworks.map(ssid => (
                <Button key={ssid} title={ssid} onPress={() => setSelectedSSID(ssid)} color={selectedSSID === ssid ? theme.accent : undefined} />
              ))}
            </ScrollView>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
              placeholder="Password"
              placeholderTextColor={theme.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button title="Send Wi-Fi Credentials" onPress={sendWifiCredentials} disabled={loading || !password} color={theme.accent} />
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BluetoothScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 15 },
});
