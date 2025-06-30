import React from 'react';
import {View, Text, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView,} from 'react-native';
import { useTheme } from '../context/themeContext';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/iconButton';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => console.log('Logged out') },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action is irreversible. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => console.log('Account deleted'), style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header]}>
        <IconButton icon="🏠" onPress={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.heading, { color: theme.text }]}>Settings</Text>

        <SettingsItem label="Change Name" onPress={() => navigation.navigate('editName' as never)} theme={theme} />
        <SettingsItem label="Change Address" onPress={() => navigation.navigate('editAddress' as never)} theme={theme} />
        <SettingsItem label="Change Language" onPress={() => navigation.navigate('language' as never)} theme={theme} />

        <View style={[styles.switchItem, { borderBottomColor: theme.muted }]}>
          <Text style={[styles.itemLabel, { color: theme.text }]}>Dark Theme</Text>
          <Switch value={theme.background === '#1c1c1e'} onValueChange={toggleTheme} />
        </View>

        <SettingsItem label="Privacy & Security" onPress={() => {}} theme={theme} />
        <SettingsItem label="Notifications" onPress={() => {}} theme={theme} />
        <SettingsItem label="About App" onPress={() => {}} theme={theme} />

        <SettingsItem label="Log Out" onPress={handleLogout} theme={theme} textColor="red" />
        <SettingsItem label="Delete Account" onPress={handleDeleteAccount} theme={theme} textColor="red" />
      </ScrollView>
    </SafeAreaView>
  );
}

type SettingsItemProps = {
  label: string;
  onPress: () => void;
  theme: any;
  textColor?: string;
};

function SettingsItem({ label, onPress, theme, textColor }: SettingsItemProps) {
  return (
    <TouchableOpacity style={[styles.item, { borderBottomColor: theme.muted }]} onPress={onPress}>
      <Text style={[styles.itemLabel, { color: textColor || theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  itemLabel: {
    fontSize: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
});
