import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
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
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  timeZone: string;
}

const UserProfile = () => {
  const { theme } = useTheme();
  const { userId, authToken } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  const loadUserData = async () => {

    try {
      const userData = await apiRequest<User>('/user/me', 'GET', undefined, true);
      setUser(userData);

      const deviceList = await apiRequest<Device[]>(
        `/devices?email=${userId}`,
        'GET',
        undefined,
        true
      );
      setDevices(deviceList);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load data');
    }
  };

  const handleDeleteDevice = (uuid: string) => {
    Alert.alert('Delete Device', 'Are you sure you want to remove this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest('/devices/delete', 'DELETE', { uuid }, true);
            Alert.alert('Deleted', 'Device removed successfully');
            loadUserData();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete device');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadUserData();
  }, [userId, authToken]);

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

        <Text style={[styles.deviceTitle, { color: theme.text }]}>Devices:</Text>

        {devices.length === 0 ? (
          <Text style={{ color: theme.muted }}>No devices linked.</Text>
        ) : (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <View>
                <DeviceCard
                  key={item.uuid}
                  status={item.status || 'Unknown'}
                  onViewPress={() => Alert.alert(`Device Status`, item.status || 'Unknown')}
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

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={() => router.push('/bluetooth')} style={{ backgroundColor: theme.accent, padding: 12, borderRadius: 8 }}>
            <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>➕ Add Device</Text>
          </TouchableOpacity>
        </View>
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