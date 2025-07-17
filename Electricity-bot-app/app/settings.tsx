import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, Button, Alert, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import { apiRequest } from '../utils/apiClient';

const SettingsScreen = () => {
    const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();
  const { authToken, logout } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [timeZone, setTimeZone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiRequest<{
          firstName: string;
          lastName: string;
          gender: 'male' | 'female' | 'other';
          timeZone: string;
        }>('/user/me', 'GET', undefined, true, authToken);

        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setGender(data.gender || 'other');
        setTimeZone(data.timeZone || '');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load user data');
      }
    };

    if (authToken) {
      loadUser();
    }
  }, [authToken]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiRequest(
        '/user/me',
        'PUT',
        {
          firstName,
          lastName,
          gender,
          timeZone,
        },
        true,
        authToken
      );
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          placeholderTextColor={theme.muted}
        />

        <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          placeholderTextColor={theme.muted}
        />

        <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
        <View style={[styles.pickerWrapper, { borderColor: theme.accent }]}>
          <Picker selectedValue={gender} onValueChange={(value) => setGender(value)}>
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Time Zone</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
          value={timeZone}
          onChangeText={setTimeZone}
          placeholder="e.g. Europe/Kyiv"
          placeholderTextColor={theme.muted}
        />

        <Button
          title={loading ? 'Saving...' : 'Save'}
          onPress={handleSave}
          color={theme.accent}
          disabled={loading}
        />

        <View style={[styles.switchItem, { borderBottomColor: theme.muted }]}>
          <Text style={[styles.itemLabel, { color: theme.text }]}>Dark Theme</Text>
          <Switch value={theme.background === '#1c1c1e'} onValueChange={toggleTheme} />
        </View>

        <View style={{ marginTop: 30 }}>
          <Button title="Log Out" onPress={() => router.push('/login')} color="red" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, gap: 14 },
  label: { fontSize: 16, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
