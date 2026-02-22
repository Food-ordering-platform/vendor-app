import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
import { ActivityIndicator, View, Platform, StyleSheet } from "react-native";
// import { useOrderNotification } from "./hooks/useOrderNotification";
import { Toaster } from "./components/ui/Toast";

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
import PrivacyScreen from "./screens/PrivacyScreen";
import SetupLocationScreen from "./screens/SetupLocationScreen";
import VerificationPendingScreen from "./screens/VerificationPendingScreen"; // 👈 IMPORT THIS

import { ThemeProvider } from "./context/themeContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// ... [Keep your VendorTabs function exactly as it was] ...
function VendorTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 65 + (insets.bottom > 0 ? insets.bottom : 10),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          }
        ],
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
  // useOrderNotification();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      fallback={<ActivityIndicator color={COLORS.primary} />}
    >
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // 🛑 1. CHECK: Does the user have a restaurant profile?
          user?.restaurant ? (
             // 🛑 2. CHECK: Is the restaurant APPROVED?
             user.isVerified === true ? (
                // ✅ YES: Show Main App
                <>
                  <Stack.Screen name="Main" component={VendorTabs} />
                  <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
                  <Stack.Screen name="SetupLocation" component={SetupLocationScreen} />
                </>
             ) : (
                // ❌ NO: Show Pending Screen (Gatekeeper)
                <Stack.Screen 
                  name="VerificationPending" 
                  component={VerificationPendingScreen} 
                />
             )
          ) : (
            // 📝 3. NO RESTAURANT YET: Show Setup Flow
            <>
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                initialParams={{ isOnboarding: true }}
              />
              <Stack.Screen
                name="SetupLocation"
                component={SetupLocationScreen}
              />
            </>
          )
        ) : (
          // 🔒 4. NOT LOGGED IN: Show Auth Flow
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
          <SafeAreaProvider>
            <GestureHandlerRootView>
              <ThemeProvider>
                <NavigationContent />
                <Toaster />
              </ThemeProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
    paddingTop: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});