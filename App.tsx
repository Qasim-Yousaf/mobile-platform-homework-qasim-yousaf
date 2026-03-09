import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: dark ? '#1a1a1a' : '#fff' },
          headerTintColor: dark ? '#fff' : '#000',
          tabBarStyle: { backgroundColor: dark ? '#1a1a1a' : '#fff' },
          tabBarActiveTintColor: dark ? '#fff' : '#000',
          tabBarInactiveTintColor: dark ? '#888' : '#aaa',
        }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppTabs />
    </ThemeProvider>
  );
}
