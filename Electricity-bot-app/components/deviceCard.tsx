import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/themeContext';

type DeviceProps = {
  name?: string;
  status: string;
  onViewPress?: () => void;
};

export default function DeviceCard({ name = 'Unnamed Device', status, onViewPress }: DeviceProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
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
