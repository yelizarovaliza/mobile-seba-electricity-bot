import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import IconButton from '../components/iconButton';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { authToken } = useAuth();
  const router = useRouter();

  const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<string>('Loading...');
  const [lastChange, setLastChange] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadDevicesAndStatus = async () => {
    if (!authToken) return;

    setLoading(true);
    try {
      const devicesRes = await fetch('https://60bf-85-114-193-81.ngrok-free.app/devices', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const devicesData = await devicesRes.json();
      setDevices(devicesData.devices || []);

      if (devicesData.devices.length > 0) {
        const deviceId = devicesData.devices[0].id;
        const statusRes = await fetch(`https://60bf-85-114-193-81.ngrok-free.app/devices/status/${deviceId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const statusData = await statusRes.json();
        setStatus(statusData.status || 'Unknown');
        setLastChange(statusData.lastChange || 'Unknown');
      } else {
        setStatus('No Devices');
        setLastChange('-');
      }
    } catch (error) {
      setStatus('Error');
      setLastChange('-');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevicesAndStatus();
  }, [authToken]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="👤" onPress={() => router.push('/user')} />
        <Button title="Refresh" onPress={loadDevicesAndStatus} color={theme.accent} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.powerText, { color: theme.text }]}>🏠 Power: <Text style={{ color: theme.success, fontWeight: 'bold' }}>{status}</Text></Text>
          <Text style={[styles.lastChange, { color: theme.muted }]}>Last change: {lastChange}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.devicesTitle, { color: theme.text }]}>My Devices</Text>
          <View style={styles.deviceBox}>
            <View style={[styles.deviceIcon, { backgroundColor: theme.accent }]}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{devices.length}</Text>
            </View>
            <View>
              {devices.length > 0 ? (
                <Text style={[styles.deviceName, { color: theme.text }]}>{devices[0].name}</Text>
              ) : (
                <Text style={[styles.deviceName, { color: theme.text }]}>No devices linked</Text>
              )}
              <Text style={[styles.deviceStatus, { color: theme.success }]}>{status}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 },
  container: { flexGrow: 1, padding: 20, gap: 20 },
  card: { padding: 20, borderRadius: 12 },
  powerText: { fontSize: 20, marginBottom: 6 },
  lastChange: { fontSize: 14 },
  devicesTitle: { fontSize: 18, marginBottom: 12 },
  deviceBox: { flexDirection: 'row', alignItems: 'center' },
  deviceIcon: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  deviceName: { fontSize: 16 },
  deviceStatus: { fontSize: 14 },
});
