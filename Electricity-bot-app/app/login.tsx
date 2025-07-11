import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useTheme } from '../context/themeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../components/iconButton';
import { useAuth } from '../context/authContext';
import { API_BASE_URL } from '../utils/apiConfig';

const LoginScreen = () => {
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSecurePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleLogin = async () => {
    if (!isValidEmail(email) || !isSecurePassword(password)) {
      setError('Please enter valid credentials');
      return;
    }

    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(email, data.token);
        router.push('/');
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (error) {
      setError(error.message || 'Network error. Please try again later');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <IconButton icon="🏠" onPress={() => router.push('/')} style={{ marginLeft: 10 }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>🔐 Login</Text>

        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Email" placeholderTextColor={theme.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Password" placeholderTextColor={theme.muted} value={password} onChangeText={setPassword} secureTextEntry />

        {error !== '' && <Text style={[styles.errorText]}>{error}</Text>}

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={[styles.switchText, { color: theme.text }]}>Don't have an account? <Text style={[styles.linkText, { color: theme.accent }]} onPress={() => router.push('/signup')}>Sign Up</Text></Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
  },
  linkText: {
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
},
});
