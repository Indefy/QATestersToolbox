import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TestCasesScreen from '../screens/TestCasesScreen';
import BugReportScreen from '../screens/BugReportScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WebViewTestingScreen from '../screens/WebViewTestingScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#f4f4f4' },
            tabBarStyle: { 
              backgroundColor: '#ffffff', 
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0'
            },
            tabBarActiveTintColor: '#007bff',
            tabBarInactiveTintColor: '#6c757d',
          }}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ 
              title: 'QA Testers Toolbox',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="dashboard" color={color} size={size} />
              )
            }} 
          />
          <Tab.Screen 
            name="TestCases" 
            component={TestCasesScreen} 
            options={{ 
              title: 'Test Cases',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="assignment" color={color} size={size} />
              )
            }} 
          />
          <Tab.Screen 
            name="BugReport" 
            component={BugReportScreen} 
            options={{ 
              title: 'Bug Report',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="bug-report" color={color} size={size} />
              )
            }} 
          />
          <Tab.Screen 
            name="Reports" 
            component={ReportsScreen} 
            options={{ 
              title: 'Reports',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="assessment" color={color} size={size} />
              )
            }} 
          />
          <Tab.Screen 
            name="WebView Testing"
            component={WebViewTestingScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="web" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ 
              title: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="settings" color={color} size={size} />
              )
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
