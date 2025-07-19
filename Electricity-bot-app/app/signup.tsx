import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import IconButton from '../components/iconButton';
import { useAuth } from '../context/authContext';
import { apiRequest } from '../utils/apiClient';
import { Picker } from '@react-native-picker/picker';


const SignupScreen = () => {
  const { theme } = useTheme();
  const { login, authToken } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const role = 'user';

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSecurePassword = (password: string) => password.length >= 8;

  useEffect(() => {
      if (authToken) {
        router.replace('/');
      }
    }, [authToken]);

  const handleSignup = async () => {
    if (!firstName || !lastName || !gender) {
      setError('Please enter your first name, last name, and select gender.');
      return;
    } else if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    } else if (!isSecurePassword(password)) {
      setError('Password must be 8+ characters');
      return;
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');

    try {
      const token = await apiRequest<string>(
        '/register',
        'POST',
        { firstName, lastName, gender, role, email, password },
        {}
      );

      console.log('Registration successful:', token);
      const success = await login(token);
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Signup Error', 'Your account was created, but we couldn’t save your session. Please try logging in.');
      }
    } catch (err: any) {
        console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Try again later.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <IconButton icon="🏠" onPress={() => router.push('/')} style={{ marginLeft: 10 }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>📝 Sign Up</Text>

          <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="First Name" placeholderTextColor={theme.muted} value={firstName} onChangeText={setFirstName} />
          <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Last Name" placeholderTextColor={theme.muted} value={lastName} onChangeText={setLastName} />

          <Text style={{ color: theme.text, marginTop: 8 }}>Select Gender:</Text>
          <View style={[styles.pickerContainer, { borderColor: theme.accent }]}>
            <Picker
              selectedValue={gender}
              onValueChange={(value) => setGender(value)}
              dropdownIconColor={theme.text}
              style={{ color: theme.text }}
            >
              <Picker.Item label="Select..." value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Email" placeholderTextColor={theme.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

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

          <View style={[styles.passwordWrapper, { borderColor: theme.accent }]}>
            <TextInput
              style={[styles.inputField, { color: theme.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.eye}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {error !== '' && <Text style={[styles.errorText]}>{error}</Text>}

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSignup}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <Text style={[styles.switchText, { color: theme.text }]}>
            Already have an account?{' '}
            <Text style={[styles.linkText, { color: theme.accent }]} onPress={() => router.push('./login')}>
              Log In
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
  },
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
