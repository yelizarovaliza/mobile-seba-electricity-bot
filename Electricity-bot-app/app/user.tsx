import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Button, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import IconButton from '../components/iconButton';
import DeviceCard from '../components/deviceCard';
import { useAuth } from '../context/authContext';
import {API_BASE_URL} from '../utils/apiConfig'

const UserProfile = () => {
  const { theme } = useTheme();
  const { userId, authToken } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<{ name: string; address: string }>({ name: '', address: '' });
  const [devices, setDevices] = useState<{ id: string; status: string }[]>([]);

  const loadUserData = () => {
    if (!userId || !authToken) return;

    fetch(`https://your.api/user/profile?userId=${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(res => res.json())
      .then(data => setUser({ name: data.name, address: data.address }))
      .catch(() => Alert.alert('Error', 'Failed to load user info'));

    fetch(`https://your.api/user/devices?userId=${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(res => res.json())
      .then(data => setDevices(data.devices))
      .catch(() => Alert.alert('Error', 'Failed to load devices'));
  };

  useEffect(() => {
    loadUserData();
  }, [userId, authToken]);

  const handleDeleteDevice = (deviceId: string) => {
  Alert.alert('Delete Device', 'Are you sure you want to remove this device?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          const response = await fetch('${API_BASE_URL}/devices/delete/' + deviceId, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });

          if (response.ok) {
            Alert.alert('Deleted', 'Device deleted');
            loadUserData();
          } else {
            Alert.alert('Error', 'Failed to delete device');
          }
        } catch (err) {
          Alert.alert('Error', 'Network error');
        }
      },
    },
  ]);
};


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="🏠" onPress={() => router.push('/')} />
        <IconButton icon="⚙️" onPress={() => router.push('./settings')} style={{ marginLeft: 10 }} />
        <IconButton icon="🔐" onPress={() => router.push('./signup')} style={{ marginLeft: 10 }} />
      </View>

      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>User Profile</Text>
        <Text style={[styles.info, { color: theme.muted }]}>Name: {user.name}</Text>
        <Text style={[styles.info, { color: theme.muted }]}>Address: {user.address}</Text>

        <Text style={[styles.deviceTitle, { color: theme.text }]}>Devices:</Text>

        {devices.length === 0 ? (
          <Text style={{ color: theme.muted }}>No devices linked.</Text>
        ) : (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <DeviceCard
                  key={item.id}
                  status={item.status}
                  onViewPress={() => Alert.alert(`Device Status: ${item.status}`)}
                />
                <TouchableOpacity
                  style={{ marginTop: 8, backgroundColor: 'red', padding: 10, borderRadius: 6 }}
                  onPress={() => handleDeleteDevice(item.id)}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>Delete Device</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <View style={{ marginTop: 20 }}>
          <Button title="➕ Add Device" onPress={() => router.push('/bluetooth')} color={theme.accent} />
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