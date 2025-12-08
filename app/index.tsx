// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; // Using Expo icons for simplicity

// Screens (We will create these next)
import DashboardScreen from '../screens/DashboardScreen'; // Order Command Center
import AddMenuItemScreen from '../screens/AddMenuItemScreen';
import EarningsScreen from "../screens/EarningScreen"

import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// The Main Tab Bar (Dashboard, Menu, Earnings)
function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Orders') iconName = 'fast-food-outline';
          else if (route.name === 'Menu') iconName = 'restaurant-outline';
          else if (route.name === 'Earnings') iconName = 'wallet-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Orders" component={DashboardScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth Flow */}
        
        {/* Main App */}
        <Stack.Screen name="Main" component={VendorTabs} />
        
        {/* Modals/Sub-screens */}
        <Stack.Screen 
          name="AddMenuItem" 
          component={AddMenuItemScreen} 
          options={{ headerShown: true, title: 'Add New Dish', headerTintColor: COLORS.primary }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}