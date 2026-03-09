import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const stats = [
  { label: 'Active Users', value: '1,204' },
  { label: 'Commands Run', value: '348' },
  { label: 'Avg. Session', value: '4m 12s' },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <ScrollView style={{ backgroundColor: dark ? '#111' : '#fff' }} contentContainerStyle={styles.container}>
      <Text style={[styles.heading, { color: dark ? '#fff' : '#000' }]}>Welcome to AgentApp</Text>
      <Text style={[styles.sub, { color: dark ? '#aaa' : '#666' }]}>Your AI-powered command assistant</Text>
      <View style={styles.cards}>
        {stats.map(stat => (
          <View key={stat.label} style={[styles.card, { backgroundColor: dark ? '#222' : '#f2f2f2' }]}>
            <Text style={[styles.cardValue, { color: dark ? '#fff' : '#000' }]}>{stat.value}</Text>
            <Text style={[styles.cardLabel, { color: dark ? '#aaa' : '#555' }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    marginBottom: 32,
  },
  cards: {
    gap: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
  },
});


