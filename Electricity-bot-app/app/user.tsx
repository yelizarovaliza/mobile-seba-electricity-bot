import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, TouchableOpacity, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import IconButton from '../components/iconButton';
import DeviceCard from '../components/deviceCard';
import { useAuth } from '../context/authContext';
import { apiRequest } from '../utils/apiClient';

interface Device {
  uuid: string;
  name?: string;
  status?: string;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    timeZone: string;
    role?: string;
}

const UserProfile = () => {
  const { theme } = useTheme();
  const { authToken, logout, isLoading } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(false);

  useEffect(() => {
      if (!isLoading && !authToken) {
        router.replace('/login');
      }
    }, [authToken]);

  const loadUserData = async () => {
    try {
      const userData = await apiRequest<User>(
          '/user/me',
          'GET',
          undefined,
          {token: authToken!}
      );
      setUser(userData);
    } catch (err: any) {
            console.error('Failed to load user info:', err);
            if (err.message.includes('Unauthorized')) {
              logout();
            } else {
              Alert.alert('Error', err.message || 'Failed to load user info');
            }
          }
        };

  const fetchDevices = async () => {
    if (!user?.email) {
      Alert.alert('User email missing', 'Cannot fetch devices without user email.');
      return;
    }

    setDeviceLoading(true);
    try {
      const list = await apiRequest<Device[]>(
        `/devices?email=${user.email}`,
        'GET',
        undefined,
        { token: authToken! }
      );
    setDevices(Array.isArray(list.devices) ? list.devices : []);
    } catch (err: any) {
      console.log('Devices to render:', list.devices);
      console.warn('No devices found or failed to load devices:', err.message);
      setDevices([]);
    } finally {
      setDeviceLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadUserData();
    }
  }, [authToken]);

  const handleDeleteDevice = (uuid: string) => {
    Alert.alert('Delete Device', 'Are you sure you want to remove this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(
                `/devices/delete/${uuid}`,
                'DELETE',
                undefined,
                {token: authToken! }
            );
            fetchDevices();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete device');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (authToken) {
      loadUserData();
    }
  }, [authToken]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="🏠" onPress={() => router.push('/')} />
        <IconButton icon="⚙️" onPress={() => router.push('/settings')} style={{ marginLeft: 10 }} />
        <IconButton icon="🔐" onPress={() => router.push('/signup')} style={{ marginLeft: 10 }} />
      </View>

      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>User Profile</Text>

        {user ? (
          <>
            <Text style={[styles.info, { color: theme.muted }]}>Name: {user.firstName} {user.lastName}</Text>
            <Text style={[styles.info, { color: theme.muted }]}>Email: {user.email}</Text>
            <Text style={[styles.info, { color: theme.muted }]}>Gender: {user.gender}</Text>
            <Text style={[styles.info, { color: theme.muted }]}>TimeZone: {user.timeZone}</Text>
          </>
        ) : (
          <Text style={[styles.info, { color: theme.muted }]}>Loading user info...</Text>
        )}

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={() => router.push('/bluetooth')} style={{ backgroundColor: theme.accent, padding: 12, borderRadius: 8 }}>
            <Text style={{ textAlign: 'center', color: 'white', fontWeight: '800' }}>➕ Add Device</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button title="🔍 Show My Devices" onPress={fetchDevices} color={theme.accent} disabled={deviceLoading} />
        </View>

        {devices.length > 0 && (
          <FlatList
            style={{ marginTop: 20 }}
            data={devices}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12 }}>

                <DeviceCard
                  name={item.name}
                  key={item.uuid}
                  status={item.status || 'Unknown'}
                  onViewPress={() => router.push(`/history/${item.uuid}`)}
                />
                <TouchableOpacity
                  style={{ marginTop: 8, backgroundColor: 'red', padding: 10, borderRadius: 6 }}
                  onPress={() => handleDeleteDevice(item.uuid)}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>Delete Device</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, marginTop: 10 },
  container: { flex: 1, padding: 20, paddingTop: 10 },
  title: { fontSize: 24, marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 4 },
  deviceTitle: { marginTop: 30, fontSize: 20, marginBottom: 10 },
});