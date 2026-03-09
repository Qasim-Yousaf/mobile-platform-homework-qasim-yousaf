import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getLog, LogEntry } from '../agent/CommandRouter';

const PREFS_KEY = 'user_preferences';

type Props = {
  pendingPref?: { key: string; value: boolean } | null;
  onPrefApplied?: () => void;
};

export default function ProfileScreen({ pendingPref, onPrefApplied }: Props) {
  const { theme, darkMode, setDarkMode } = useTheme();
  const dark = theme === 'dark';
  const [notifications, setNotifications] = useState(true);
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(val => {
      if (val) {
        const prefs = JSON.parse(val);
        setNotifications(prefs.notifications ?? true);
      }
    });
  }, []);

  useEffect(() => {
    setLog(getLog());
  }, [pendingPref]);

  useEffect(() => {
    if (!pendingPref) return;
    if (pendingPref.key === 'notifications') {
      applyNotifications(pendingPref.value);
    }
    if (pendingPref.key === 'darkMode') {
      setDarkMode(pendingPref.value);
    }
    onPrefApplied?.();
  }, [pendingPref]);

  function applyNotifications(value: boolean) {
    setNotifications(value);
    AsyncStorage.getItem(PREFS_KEY).then(val => {
      const prefs = val ? JSON.parse(val) : {};
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, notifications: value }));
    });
  }

  function refreshLog() {
    setLog(getLog());
  }

  const statusColor = (status: LogEntry['status']) => {
    if (status === 'executed') return '#34c759';
    if (status === 'rejected') return '#ff3b30';
    return '#ff9500';
  };

  return (
    <ScrollView
      style={{ backgroundColor: dark ? '#111' : '#fff' }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refreshLog} />}>
      <Text style={[styles.name, { color: dark ? '#fff' : '#000' }]}>Qasim Yousaf</Text>
      <Text style={[styles.role, { color: dark ? '#aaa' : '#888' }]}>Mobile Platform Lead</Text>
      <View style={[styles.section, { backgroundColor: dark ? '#222' : '#f2f2f2' }]}>
        <View style={[styles.row, { borderBottomColor: dark ? '#333' : '#e0e0e0' }]}>
          <Text style={[styles.label, { color: dark ? '#fff' : '#000' }]}>Notifications</Text>
          <Switch value={notifications} onValueChange={v => applyNotifications(v)} />
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={[styles.label, { color: dark ? '#fff' : '#000' }]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: dark ? '#fff' : '#000' }]}>Agent Activity Log</Text>
      {log.length === 0 ? (
        <Text style={[styles.emptyLog, { color: dark ? '#666' : '#aaa' }]}>No commands yet. Pull to refresh.</Text>
      ) : (
        [...log].reverse().map(entry => (
          <View key={entry.id} style={[styles.logEntry, { backgroundColor: dark ? '#1e1e1e' : '#f9f9f9', borderColor: dark ? '#333' : '#e0e0e0' }]}>
            <View style={styles.logHeader}>
              <Text style={[styles.logCommand, { color: dark ? '#fff' : '#000' }]}>{entry.command}</Text>
              <View style={[styles.logBadge, { backgroundColor: statusColor(entry.status) + '22' }]}>
                <Text style={[styles.logStatus, { color: statusColor(entry.status) }]}>{entry.status}</Text>
              </View>
            </View>
            {entry.reason && (
              <Text style={[styles.logReason, { color: dark ? '#aaa' : '#666' }]}>{entry.reason}</Text>
            )}
            <Text style={[styles.logTime, { color: dark ? '#555' : '#bbb' }]}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 12,
  },
  emptyLog: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  logEntry: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logCommand: {
    fontSize: 14,
    fontWeight: '600',
  },
  logBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  logStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  logReason: {
    fontSize: 12,
    marginBottom: 4,
  },
  logTime: {
    fontSize: 11,
  },
});


