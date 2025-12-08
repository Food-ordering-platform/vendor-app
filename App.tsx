// App.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import your existing screens
import DashboardScreen from './screens/DashboardScreen';
import AddMenuItemScreen from './screens/AddMenuItemScreen';
// Note: Ensure the file is named EarningScreen.tsx or EarningsScreen.tsx and matches this import
import EarningsScreen from './screens/EarningScreen'; 

import { COLORS, SPACING } from './constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Placeholder Screens (If you haven't created files for them yet) ---
const LoginScreen = ({ navigation }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 }}>Vendor Login</Text>
    <TouchableOpacity 
      style={{ backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10 }}
      onPress={() => navigation.replace('Main')}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Login (Test)</Text>
    </TouchableOpacity>
  </View>
);

const MenuScreen = ({ navigation }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Menu Management</Text>
    <TouchableOpacity 
      style={{ backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
      onPress={() => navigation.navigate('AddMenuItem')}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>+ Add New Item</Text>
    </TouchableOpacity>
  </View>
);

// --- Navigation Structure ---

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
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={VendorTabs} />
        <Stack.Screen 
          name="AddMenuItem" 
          component={AddMenuItemScreen} 
          options={{ headerShown: true, title: 'Add New Dish', headerTintColor: COLORS.primary }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}