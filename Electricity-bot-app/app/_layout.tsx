import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/themeContext';
import { BluetoothProvider } from '../context/bluetoothContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <BluetoothProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BluetoothProvider>
    </ThemeProvider>
  );
}
