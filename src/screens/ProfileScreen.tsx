import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const PREFS_KEY = 'user_preferences';

export default function ProfileScreen() {
  const { theme, darkMode, setDarkMode } = useTheme();
  const dark = theme === 'dark';
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(val => {
      if (val) {
        const prefs = JSON.parse(val);
        setNotifications(prefs.notifications ?? true);
      }
    });
  }, []);

  function toggleNotifications() {
    const updated = !notifications;
    setNotifications(updated);
    AsyncStorage.getItem(PREFS_KEY).then(val => {
      const prefs = val ? JSON.parse(val) : {};
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, notifications: updated }));
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#111' : '#fff' }]}>
      <Text style={[styles.name, { color: dark ? '#fff' : '#000' }]}>Qasim Yousaf</Text>
      <Text style={[styles.role, { color: dark ? '#aaa' : '#888' }]}>Mobile Platform Lead</Text>
      <View style={[styles.section, { backgroundColor: dark ? '#222' : '#f2f2f2' }]}>
        <View style={[styles.row, { borderBottomColor: dark ? '#333' : '#e0e0e0' }]}>
          <Text style={[styles.label, { color: dark ? '#fff' : '#000' }]}>Notifications</Text>
          <Switch value={notifications} onValueChange={toggleNotifications} />
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={[styles.label, { color: dark ? '#fff' : '#000' }]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    marginBottom: 32,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 15,
  },
});
