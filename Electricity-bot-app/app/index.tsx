import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import IconButton from '../components/iconButton';
import { apiRequest } from '../utils/apiClient';
import moment from 'moment-timezone';

interface Device {
  uuid: string;
  name: string;
  status?: string;
  lastChange?: string;
}

const HomeScreen = () => {
  const { theme } = useTheme();
  const { authToken, logout, isLoading } = useAuth();
  const router = useRouter();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !authToken) {
      router.replace('/login');
    }
  }, [authToken]);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const user = await apiRequest<{ email: string }>('/user/me', 'GET', undefined, { token: authToken! });
        setEmail(user.email);
      } catch (err: any) {
        console.error('User fetch failed:', err);
        if (err.message.includes('Unauthorized')) {
          logout();
        }
      }
    };

    if (authToken) fetchEmail();
  }, [authToken]);

  const loadDevicesAndStatus = async () => {
    if (!authToken || !email) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<{ devices: Device[] }>(
          `/devices?email=${email}`,
          'GET',
          undefined,
          { token: authToken }
          );
      const safeDevices = Array.isArray(response.devices) ? response.devices : [];

      const devicesWithStatus = await Promise.all(
        safeDevices.map(async (device) => {
          try {
            const statusData = await apiRequest<{ status: string; lastChange: string }>(
              `/devices/status/${device.uuid}`,
              'GET',
              undefined,
              { token: authToken }
            );
            return {
              ...device,
              status: statusData.status || 'Unknown',
              lastChange: statusData.lastChange || '-',
            };
          } catch {
            return { ...device, status: 'Unavailable', lastChange: '-' };
          }
        })
      );

      setDevices(devicesWithStatus);
    } catch (error: any) {
      console.warn('Failed to load devices:', error.message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken && email) {
      loadDevicesAndStatus();
    }
  }, [email]);

  const formatTime = (isoTime?: string) => {
    if (!isoTime) return '-';
    return moment.utc(isoTime).tz('Europe/Kyiv').format('YYYY-MM-DD HH:mm');
  };

  const renderStatus = (status?: string) => {
    const isOn = status === 'ON';
    return (
      <Text style={{ color: isOn ? 'green' : 'red', fontWeight: '600' }}>
        {isOn ? '🟢 ON' : '🔴 OFF'}
      </Text>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="👤" onPress={() => router.push('/user')} />
        <IconButton icon="🔄" onPress={loadDevicesAndStatus} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        {loading && <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />}

        {!loading && devices.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.text }]}>You don’t have any devices yet.</Text>
        ) : (
          devices.map((device) => (
            <View key={device.uuid} style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.deviceName, { color: theme.text }]}>{device.name}</Text>
              <Text style={[styles.timestamp, { color: theme.muted }]}>Last change: {formatTime(device.lastChange)}</Text>
              <Text style={[styles.deviceStatus, { color: theme.text }]}>{renderStatus(device.status)}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  deviceStatus: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'right',
      marginBottom: 6,
    },
  timestamp: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});