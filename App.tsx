import React, { useRef, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AgentProvider, useAgent } from './src/agent/AgentContext';
import AgentFlyout from './src/agent/AgentFlyout';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { theme } = useTheme();
  const { openFlyout } = useAgent();
  const dark = theme === 'dark';
  const navRef = useRef<NavigationContainerRef<any>>(null);
  const [exploreFilter, setExploreFilter] = useState<{ filter: string; sort?: string } | null>(null);
  const [pendingPref, setPendingPref] = useState<{ key: string; value: boolean } | null>(null);

  function handleNavigate(screen: string) {
    const name = screen.charAt(0).toUpperCase() + screen.slice(1);
    navRef.current?.navigate(name);
  }

  function handleApplyFilter(filter: string, sort?: string) {
    setExploreFilter({ filter, sort });
  }

  function handleSetPreference(key: string, value: boolean) {
    setPendingPref({ key, value });
  }

  return (
    <NavigationContainer ref={navRef}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: dark ? '#1a1a1a' : '#fff' },
          headerTintColor: dark ? '#fff' : '#000',
          headerRight: () => (
            <TouchableOpacity style={styles.agentBtn} onPress={openFlyout}>
              <Text style={styles.agentBtnText}>Agent</Text>
            </TouchableOpacity>
          ),
          tabBarStyle: { backgroundColor: dark ? '#1a1a1a' : '#fff' },
          tabBarActiveTintColor: dark ? '#fff' : '#000',
          tabBarInactiveTintColor: dark ? '#888' : '#aaa',
        }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore">
          {() => <ExploreScreen externalFilter={exploreFilter} />}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {() => <ProfileScreen pendingPref={pendingPref} onPrefApplied={() => setPendingPref(null)} />}
        </Tab.Screen>
      </Tab.Navigator>
      <AgentFlyout
        onNavigate={handleNavigate}
        onApplyFilter={handleApplyFilter}
        onSetPreference={handleSetPreference}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AgentProvider>
        <AppTabs />
      </AgentProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  agentBtn: {
    marginRight: 16,
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  agentBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
