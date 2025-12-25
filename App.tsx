import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "./constants/theme";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/authContext";
import { ActivityIndicator, View, Platform } from "react-native";
// import { usePushNotifications } from "./hooks/usePushNotification";

// Screens
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DashboardScreen from "./screens/DashboardScreen";
import MenuScreen from "./screens/MenuScreen";
import AddMenuItemScreen from "./screens/AddMenuItemScreen";
import EarningsScreen from "./screens/EarningScreen";
import SplashScreen from "./screens/SplashScreen";
import VerifyOtpScreen from "./screens/VerifyOtpScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import VerifyResetOtpScreen from "./screens/VerifyResetOtpScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import { ThemeProvider } from "./context/themeContext";
import { SocketProvider } from "./context/socketContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// --- 1. THE TABS (Main App) ---
function VendorTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,

          // [FIX] Use calculated height instead of 'auto'
          // 60px is the content area. We add the bottom inset to it.
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),

          // [FIX] Push content up by the safe area amount
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,

          paddingTop: 10, // Top spacing for balance
        },
        tabBarIcon: ({ color, focused }) => {
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
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 5, // [FIX] Add slight margin to separate text from bottom edge
        },
      })}
    >
      <Tab.Screen name="Orders" component={DashboardScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- 2. NAVIGATION CONTROLLER ---
function NavigationContent() {
  const { isAuthenticated, isLoading, user } = useAuth(); // [FIX] Get 'user' to check restaurant status
  // usePushNotifications(user)

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // [LOGIC] Check if user has a restaurant
          user?.restaurant ? (
            // HAS RESTAURANT -> Go to Dashboard
            <>
              <Stack.Screen name="Main" component={VendorTabs} />
              <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
            </>
          ) : (
            // NO RESTAURANT -> Go to Profile (Setup Mode)
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              initialParams={{ isOnboarding: true }} // Tell profile screen we are in setup mode
            />
          )
        ) : (
          // NOT LOGGED IN -> Auth Flow
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="VerifyResetOtp"
              component={VerifyResetOtpScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <SafeAreaProvider>
            <ThemeProvider>
              <NavigationContent />
            </ThemeProvider>
          </SafeAreaProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
