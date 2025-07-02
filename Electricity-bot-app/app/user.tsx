import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import DeviceCard from '../components/deviceCard';
import IconButton from '../components/iconButton';

const UserProfile = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const [user, setUser] = useState({
    name: 'John Doe',
    address: '123 Main St, Springfield',
  });

  const [devices, setDevices] = useState([
    {
      id: 'device-001',
      status: 'online',
    },
  ]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
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
        <View style={styles.deviceList}>
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              status={device.status}
              onViewPress={() => alert(`Device: ${device.status}`)}
            />
          ))}
        </View>

        {/* ➕ КНОПКА "ДОДАТИ ПРИСТРІЙ" */}
        <View style={{ marginTop: 20 }}>
          <Button
            title="➕ Додати пристрій"
            onPress={() => router.push('/bluetooth')}
            color={theme.accent || '#007AFF'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserProfile;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
  deviceTitle: {
    marginTop: 30,
    fontSize: 20,
    marginBottom: 10,
  },
  deviceList: {
    paddingBottom: 20,
  },
  deviceCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceLocation: {
    fontSize: 18,
  },
  deviceStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  viewButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});