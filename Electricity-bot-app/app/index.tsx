import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import IconButton from '../components/iconButton';
import { apiRequest } from '../utils/apiClient';


interface Device {
  uuid: string;
  name: string;
  status?: string;
  lastChange?: string;
}

const HomeScreen = () => {
  const { theme } = useTheme();
  const { authToken, userId } = useAuth();
  const router = useRouter();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadDevicesAndStatus = async () => {
    if (!authToken || !userId) return;

    setLoading(true);
    try {
      const devicesData = await apiRequest<Device[]>(
        `/devices?email=${userId}`,
        'GET',
        undefined,
        true,
        authToken
      );

      const devicesWithStatus = await Promise.all(
        devicesData.map(async (device) => {
          try {
            const statusData = await apiRequest<{ status: string; lastChange: string }>(
              `/devices/status/${device.uuid}`,
              'GET',
              undefined,
              true,
              authToken
            );
            return { ...device, status: statusData.status, lastChange: statusData.lastChange };
          } catch {
            return { ...device, status: 'Unavailable', lastChange: '-' };
          }
        })
      );

      setDevices(devicesWithStatus);
    } catch (error) {
      console.error('Failed to load devices:', error);
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
        {loading && <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />}

        {devices.length === 0 && !loading ? (
          <Text style={[styles.emptyText, { color: theme.text }]}>No devices linked</Text>
        ) : (
          devices.map((device) => (
            <View key={device.uuid} style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.deviceName, { color: theme.text }]}>{device.name || 'Unnamed Device'}</Text>
              <Text style={[styles.deviceStatus, { color: theme.success }]}>Status: {device.status}</Text>
              <Text style={[styles.lastChange, { color: theme.muted }]}>Last change: {device.lastChange}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 },
  container: { flexGrow: 1, padding: 20, gap: 16 },
  card: { padding: 20, borderRadius: 12 },
  deviceName: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  deviceStatus: { fontSize: 16 },
  lastChange: { fontSize: 14 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 30 },
});
