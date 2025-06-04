import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../app/themeContext';

type DeviceProps = {
  location: string;
  status: string;
  onViewPress?: () => void;
};

export default function DeviceCard({ location, status, onViewPress }: DeviceProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View>
        <Text style={[styles.location, { color: theme.text }]}>{location}</Text>
        <Text style={[styles.status, { color: theme.muted }]}>Status: {status.toUpperCase()}</Text>
      </View>
      <Pressable
        onPress={onViewPress}
        style={[styles.button, { backgroundColor: theme.accent }]}
      >
        <Text style={styles.buttonText}>View</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    fontSize: 18,
  },
  status: {
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});