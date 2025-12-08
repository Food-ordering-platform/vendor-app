// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "./constants/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

// --- IMPORT ALL YOUR SCREENS ---
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen"; // New Signup Page
import ProfileScreen from "./screens/ProfileScreen"; // New Profile Setup Page
import DashboardScreen from "./screens/DashboardScreen";
import MenuScreen from "./screens/MenuScreen";
import AddMenuItemScreen from "./screens/AddMenuItemScreen";
import EarningsScreen from "./screens/EarningScreen";

// 1. Create the two types of navigation we need
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 2. Define the "Inside the App" area (The Tabs)
// This only runs AFTER the user has logged in/signed up.
function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        // This function decides which icon to show for each tab
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          if (route.name === "Orders")
            iconName = focused ? "fast-food" : "fast-food-outline";
          else if (route.name === "Menu")
            iconName = focused ? "restaurant" : "restaurant-outline";
          else if (route.name === "Earnings")
            iconName = focused ? "wallet" : "wallet-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Orders" component={DashboardScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      {/* We add Profile here so they can edit it later */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// 3. The Main App Entry Point
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />

        {/* The Stack handles the flow BEFORE they get into the dashboard */}
        <Stack.Navigator
          initialRouteName="Onboarding" // Start here
          screenOptions={{ headerShown: false }}
        >
          {/* Step 1: Onboarding Slider */}
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          {/* Step 2: Authentication */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />

          {/* Step 3: Setup (We put Profile here so we can force them to fill it before Dashboard) */}
          <Stack.Screen name="Profile" component={ProfileScreen} />

          {/* Step 4: The Actual App (Dashboard, Menu, etc.) */}
          <Stack.Screen name="Main" component={VendorTabs} />

          {/* Helper Screens (Like Modals) */}
          <Stack.Screen
            name="AddMenuItem"
            component={AddMenuItemScreen}
            options={{
              headerShown: true,
              title: "Add New Dish",
              headerTintColor: COLORS.primary,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
