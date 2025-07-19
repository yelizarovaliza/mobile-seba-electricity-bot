import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
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
          const user = await apiRequest<{ email: string }>(
            '/user/me',
            'GET',
            undefined,
            { token: authToken! }
          );
          setEmail(user.email);
        } catch (err: any) {
          console.error('User fetch failed:', err);
          if (err.message.includes('Unauthorized')) {
            logout();
          } else {
            Alert.alert('Error', err.message || 'Failed to load user info');
          }
        }
      };

      if (authToken) fetchEmail();
    }, [authToken]);

  const loadDevicesAndStatus = async () => {
    if (!authToken || !email) {
      Alert.alert('Not authenticated', 'Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const devicesData = await apiRequest<Device[]>(
          `/devices?email=${email}`,
          'GET',
          undefined,
          {token: authToken}
      );
      const safeDevices = Array.isArray(devicesData) ? devicesData : [];

      const devicesWithStatus = await Promise.all(
        safeDevices.map(async (device) => {
          try {
            const statusData = await apiRequest<{ status: string; lastChange: string }>(
              `/devices/status/${device.uuid}`,
              'GET',
              undefined,
              {token: authToken}
            );
            return {
              ...device,
              status: statusData.status || 'Unknown',
              lastChange: statusData.lastChange || '-',
            };
          } catch (e) {
            console.warn(`Failed to fetch status for ${device.uuid}:`, e);
            return {
              ...device,
              status: 'Unavailable',
              lastChange: '-',
            };
          }
        })
      );

      setDevices(devicesWithStatus);
    } catch (error: any) {
            if (error.message.includes('Unauthorized')) {
              logout();
            } else {
              console.warn('Failed to load devices list:', error.message);
              setDevices([]);
            }
          } finally {
            setLoading(false);
          }
        };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="👤" onPress={() => router.push('/user')} />
        <Button title="Refresh" onPress={loadDevicesAndStatus} color={theme.accent} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        {loading && <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />}

        {!loading && devices.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.text }]}>You don’t have any devices yet.</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
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
    fontSize: 16,
  },
  lastChange: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});
