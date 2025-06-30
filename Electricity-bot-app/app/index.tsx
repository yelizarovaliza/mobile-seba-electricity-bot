import { Link, router, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import IconButton from '../components/iconButton';

const HomeScreen = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Profile Button*/}
        <View style={styles.header}>
        <IconButton icon="👤" onPress={() => router.push('/user')} />
          </View>
      </View>

      {/* Main Content */}
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Power Section */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.powerText, { color: theme.text }]}>
            🏠 Power: <Text style={{ color: theme.success, fontWeight: 'bold' }}>On</Text>
          </Text>
          <Text style={[styles.lastChange, { color: theme.muted }]}>Last change: 10:24 AM</Text>
        </View>

        {/* Devices Section */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.devicesTitle, { color: theme.text }]}>My Devices</Text>
          <View style={styles.deviceBox}>
            <View style={[styles.deviceIcon, { backgroundColor: theme.accent }]}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>0</Text>
            </View>
            <View>
              <Text style={[styles.deviceName, { color: theme.text }]}>Apartment Sensor</Text>
              <Text style={[styles.deviceStatus, { color: theme.success }]}>Online</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
  },
  powerText: {
    fontSize: 20,
    marginBottom: 6,
  },
  lastChange: {
    fontSize: 14,
  },
  devicesTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  deviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
  },
  deviceStatus: {
    fontSize: 14,
  },
});
