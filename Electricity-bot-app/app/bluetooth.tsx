import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert, ActivityIndicator, TextInput, PermissionsAndroid, Platform, ScrollView, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BleManager } from 'react-native-ble-plx';
import { useRouter } from 'expo-router';
import base64 from 'react-native-base64';
import IconButton from '../components/iconButton';
import { useTheme } from '../context/themeContext';

const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef1';
const SCAN_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef2';
const CONFIG_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef3';
const MAX_WIFI_CREDENTIAL_LENGTH = 30;

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

      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );

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
    setConnectedDevice(null);
    setWifiNetworks([]);
    setSelectedSSID(null);
    setPassword('');
    setIsScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Alert.alert('Scan Error', error.message);
        setIsScanning(false);
        return;
      }

      if (device?.name?.includes('RaspberryPi_WiFiConfig')) {
        setDevices(prev =>
          prev.some(d => d.id === device.id)
            ? prev
            : [...prev, { id: device.id, name: device.name }]
        );
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
      console.log('[BLE] Connecting to device:', deviceId);
      bleManager.stopDeviceScan();

      const device = await bleManager.connectToDevice(deviceId, { autoConnect: false });
      console.log('[BLE] Connected to:', device.name);

      await device.discoverAllServicesAndCharacteristics();
      console.log('[BLE] Services and characteristics discovered');

      await new Promise(resolve => setTimeout(resolve, 1000));

      const allCharacteristics = await device.characteristicsForService(SERVICE_UUID);
      console.log('[BLE] Characteristics:', allCharacteristics.map(c => c.uuid));

      const targetChar = allCharacteristics.find(c => c.uuid.toLowerCase() === SCAN_CHAR_UUID.toLowerCase());

      if (!targetChar) {
        Alert.alert('Characteristic Missing', 'Не знайдено характеристику SCAN_CHAR_UUID');
        setLoading(false);
        return;
      }

      const read = await targetChar.read();
      const value = read?.value ? base64.decode(read.value) : '';
      console.log('[BLE] Raw value:', value);

      const decoded = value;
      console.log('[BLE] Decoded:', decoded);

      const networks = decoded.split(',').filter(Boolean);
      setWifiNetworks(networks);
      setConnectedDevice(device);

    } catch (e: any) {
      console.error('[BLE] connectToDevice error:', e);
      Alert.alert('Connection Error', e.message || 'Failed to connect');
    }
    setLoading(false);
  };




  const sendWifiCredentials = async () => {
    if (!connectedDevice || !selectedSSID) {
      Alert.alert('Missing Info', 'Please select a network and enter password.');
      return;
    }

    const credentials = `${selectedSSID},${password}`;
    if (credentials.length > MAX_WIFI_CREDENTIAL_LENGTH) {
      Alert.alert('Too long', 'SSID + password is too long for device to accept.');
      return;
    }

    setLoading(true);

    try {
      const connected = await connectedDevice.isConnected();
      if (!connected) {
        console.warn('[BLE] Reconnecting to device...');
        await connectedDevice.connect();
        await connectedDevice.discoverAllServicesAndCharacteristics();
      }

      const encoded = base64.encode(credentials);
      console.log('[BLE] Sending encoded:', encoded);

      await new Promise(resolve => setTimeout(resolve, 300));
      await connectedDevice.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        CONFIG_CHAR_UUID,
        encoded
      );

      Alert.alert('Success', 'Wi-Fi credentials sent.');
      router.push('/user');

    } catch (e: any) {
      console.error('[BLE] Send Error:', e);
      Alert.alert('Send Error', e.message || 'Failed to send credentials');
    }
    setLoading(false);
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="🏠" onPress={() => router.push('/')} />
        <Button
          title={isScanning ? 'Scanning...' : 'Refresh'}
          onPress={startScan}
          disabled={isScanning}
          color={theme.accent}
        />
      </View>

      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>🔍 Available BLE Devices:</Text>

        {isScanning || loading ? <ActivityIndicator size="large" color={theme.accent} /> : null}

        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Button
              title={item.name || 'Unnamed Device'}
              onPress={() => connectToDevice(item.id)}
              disabled={loading}
              color={theme.accent}
            />
          )}
        />

        {wifiNetworks.length > 0 && (
          <KeyboardAvoidingView behavior="padding" style={{ marginTop: 20 }}>
            <Text style={[styles.title, { color: theme.text }]}>📶 Select Wi-Fi Network:</Text>
            <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
              {wifiNetworks.map(ssid => (
                <Button
                  key={ssid}
                  title={ssid}
                  onPress={() => setSelectedSSID(ssid)}
                  color={selectedSSID === ssid ? theme.accent : undefined}
                />
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
            <Button
              title="Send Wi-Fi Credentials"
              onPress={sendWifiCredentials}
              disabled={loading || !password}
              color={theme.accent}
            />
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BluetoothScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  container: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});
