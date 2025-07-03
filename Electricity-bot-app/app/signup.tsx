import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import IconButton from '../components/iconButton';
import { useAuth } from '../context/authContext';

const SignupScreen = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSecurePassword = (password: string): boolean => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSignup = () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
    } else if (!isSecurePassword(password)) {
      setError('Password must be 8+ characters with a number and special character.');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      setError('');
      login(email, 'dummy_token');
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <IconButton icon="🏠" onPress={() => router.push('/')} style={{ marginLeft: 10 }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>📝 Sign Up</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Email" placeholderTextColor={theme.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Password" placeholderTextColor={theme.muted} value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Confirm Password" placeholderTextColor={theme.muted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        {error !== '' && <Text style={[styles.errorText]}>{error}</Text>}
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSignup}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <Text style={[styles.switchText, { color: theme.text }]}>Already have an account? <Text style={[styles.linkText, { color: theme.accent }]} onPress={() => router.push('./login')}>Log In</Text></Text>
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;

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
