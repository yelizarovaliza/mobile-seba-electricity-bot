import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/themeContext';
import { BluetoothProvider } from '../context/bluetoothContext';
import { AuthProvider } from "../context/authContext";

export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BluetoothProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BluetoothProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
