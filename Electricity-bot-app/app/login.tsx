import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import IconButton from '../components/iconButton';
import { useAuth } from '../context/authContext';
import { apiRequest } from '../utils/apiClient';

const LoginScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSecurePassword = (password: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleLogin = async () => {
    if (!isValidEmail(email) || !isSecurePassword(password)) {
      setError('Please enter valid credentials');
      return;
    }

    setError('');

    try {
      const data = await apiRequest<{ id: string; token: string }>(
        '/login',
        'POST',
        { username: email, password },
        false
      );

      await login(data.id, data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Try again later.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <IconButton icon="🏠" onPress={() => router.push('/')} style={{ marginLeft: 10 }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>🔐 Login</Text>

          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Email"
            placeholderTextColor={theme.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={[styles.passwordWrapper, { borderColor: theme.accent }]}>
            <TextInput
              style={[styles.inputField, { color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {error !== '' && <Text style={[styles.errorText]}>{error}</Text>}

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <Text style={[styles.switchText, { color: theme.text }]}>
            Don't have an account?{' '}
            <Text style={[styles.linkText, { color: theme.accent }]} onPress={() => router.push('/signup')}>
              Sign Up
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  eye: {
    fontSize: 20,
    marginLeft: 10,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 16,
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
