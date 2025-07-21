import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../context/authContext';
import { apiRequest } from '../../utils/apiClient';
import IconButton from '../../components/iconButton';

interface HistoryEntry {
  status: 'ON' | 'OFF';
  timestamp: string;
}

const DeviceHistoryScreen = () => {
  const { uuid } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { authToken } = useAuth();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    if (!authToken) {
      Alert.alert('Unauthorized', 'Please log in again.');
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<{ history: HistoryEntry[] }>(
        `/devices?uuid=${uuid}`,
        'GET',
        undefined,
        { token: authToken }
      );
      setHistory(response.history || []);
    } catch (err: any) {
      console.error('Error loading history:', err);
      Alert.alert('Error', err.message || 'Failed to load device history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid && authToken) {
      loadHistory();
    }
  }, [uuid, authToken]);

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <View style={[styles.item, { backgroundColor: theme.card }]}>
      <Text
        style={[
          styles.status,
          {
            color:
              item.status === 'ON'
                ? theme.success || '#4CD964'
                : theme.error || '#FF3B30',
          },
        ]}
      >
        {item.status === 'ON' ? '🟢 ON' : '🔴 OFF'}
      </Text>
      <Text style={[styles.timestamp, { color: theme.text }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton icon="⬅️" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.text }]}>{}History</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.text }]}>No history available.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

export default DeviceHistoryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  list: {
    padding: 16,
  },
  item: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
