import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../app/themeContext';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  style?: object;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, style }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.card }, style]}
    >
      <Text style={[styles.iconText, { color: theme.icon }]}>{icon}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
});

export default IconButton;
