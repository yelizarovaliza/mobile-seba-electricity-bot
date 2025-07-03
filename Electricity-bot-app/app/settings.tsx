import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/themeContext';
import { useNavigation, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/iconButton';
import { useAuth } from '../context/authContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action is irreversible. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => {
        try {
          const response = await fetch('https://your.api/user/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            Alert.alert('Account deleted');
            logout();
          } else {
            Alert.alert('Error', 'Failed to delete account');
          }
        } catch (err) {
          Alert.alert('Error', 'Network error during deletion');
        }
      }, style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header]}>
        <IconButton icon="🏠" onPress={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.heading, { color: theme.text }]}>Settings</Text>

        <View style={[styles.switchItem, { borderBottomColor: theme.muted }]}>
          <Text style={[styles.itemLabel, { color: theme.text }]}>Dark Theme</Text>
          <Switch value={theme.background === '#1c1c1e'} onValueChange={toggleTheme} />
        </View>

        <SettingsItem label="Log Out" onPress={handleLogout} theme={theme} textColor="red" />
        <SettingsItem label="Delete Account" onPress={handleDeleteAccount} theme={theme} textColor="red" />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsItem({ label, onPress, theme, textColor }) {
  return (
    <TouchableOpacity style={[styles.item, { borderBottomColor: theme.muted }]} onPress={onPress}>
      <Text style={[styles.itemLabel, { color: textColor || theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, marginTop: 10 },
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  item: { paddingVertical: 16, borderBottomWidth: 0.5 },
  itemLabel: { fontSize: 16 },
  switchItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5 },
});