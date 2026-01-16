import React from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native"; // 👈 Import LinkingOptions
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "./constants/theme";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/authContext";
import { ActivityIndicator, View } from "react-native";
import { useOrderNotification } from "./hooks/useOrderNotification";
import * as Linking from "expo-linking";

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
import TermsScreen from "./screens/TermsScreen";
import PrivacyScreen from './screens/PrivacyScreen';
import SetupLocationScreen from './screens/SetupLocationScreen';

import { ThemeProvider } from "./context/themeContext";
import { SocketProvider } from "./context/socketContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// 👇 CRITICAL FIX: Add type annotation <any> to ignore strict checking
const linking: LinkingOptions<any> = {
  prefixes: [Linking.createURL('/'), 'https://vendor.choweazy.vercel.app'],
  config: {
    screens: {
      Splash: 'splash',
      Onboarding: 'welcome',
      Login: 'login',
      Signup: 'signup',
      Terms: 'terms',
      Privacy: 'privacy',
      VerifyOtp: 'verify-otp',
      ForgotPassword: 'forgot-password',
      VerifyResetOtp: 'verify-reset',
      ResetPassword: 'reset-password',

      // Nested Navigator (Tabs)
      Main: {
        screens: {
          Orders: 'orders',
          Menu: 'menu',
          Earnings: 'earnings',
          Profile: 'profile',
        },
      },
      
      AddMenuItem: 'add-item',
      SetupLocation: 'setup-location',
    },
  },
};

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
          height: 90 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any;
          if (route.name === "Orders") iconName = focused ? "fast-food" : "fast-food-outline";
          else if (route.name === "Menu") iconName = focused ? "restaurant" : "restaurant-outline";
          else if (route.name === "Earnings") iconName = focused ? "wallet" : "wallet-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
      })}
    >
      <Tab.Screen name="Orders" component={DashboardScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function NavigationContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  useOrderNotification();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} fallback={<ActivityIndicator color={COLORS.primary} />}>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          user?.restaurant ? (
            <>
              <Stack.Screen name="Main" component={VendorTabs} />
              <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
              <Stack.Screen name="SetupLocation" component={SetupLocationScreen} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                initialParams={{ isOnboarding: true }}
              />
              <Stack.Screen name="SetupLocation" component={SetupLocationScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyResetOtp" component={VerifyResetOtpScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
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