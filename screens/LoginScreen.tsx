import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/themeContext";
import { SPACING, SHADOWS, COLORS } from "../constants/theme";
import { useAuth } from "../context/authContext"; 
import { SafeAreaProvider } from "react-native-safe-area-context";
// 1. Import Schema
import { loginSchema } from "../utils/schema";

export default function LoginScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Error State
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth(); 

  const handleLogin = async () => {
    // 3. Validate with Zod
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const formattedErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    // Clear errors if valid
    setErrors({});

    try {
      setLoading(true);
      // Use validated data
      const data = await login({ email: result.data.email, password: result.data.password });

      if (data.requireOtp) {
        setLoading(false);
        navigation.navigate("VerifyOtp", {
          token: data.token,
          email: data.user?.email || email,
        });
        return;
      }

      if (data.user && data.user.role !== "VENDOR") {
        setLoading(false);
        Alert.alert("Unauthorized", "This app is for Vendors only.");
        return;
      }
      
    } catch (error: any) {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Welcome back, Partner
          </Text>
          <Text style={[styles.subText, { color: colors.textLight }]}>
            Sign in to manage your kitchen.
          </Text>
        </View>

        <View style={styles.form}>
          {/* EMAIL INPUT */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surface, 
                  borderColor: errors.email ? 'red' : colors.border, // Red border on error
                  color: colors.text 
                },
              ]}
              placeholder="vendor@choweasy.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textLight}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* PASSWORD INPUT */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surface, 
                  borderColor: errors.password ? 'red' : colors.border, 
                  color: colors.text 
                },
              ]}
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              secureTextEntry
              placeholderTextColor={colors.textLight}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={[styles.forgotText, { color: COLORS.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.primary }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            New to ChowEasy?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={[styles.signupText, { color: COLORS.primary }]}>
              Become a Vendor
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.l, justifyContent: "center" },
  header: { marginBottom: SPACING.xl, alignItems: "center" },
  logoContainer: {
    marginBottom: SPACING.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: { width: 100, height: 100, borderRadius: 20 },
  welcomeText: { fontSize: 24, fontWeight: "bold", marginBottom: SPACING.xs, textAlign: "center" },
  subText: { fontSize: 16, textAlign: "center" },
  form: { marginTop: SPACING.m },
  inputGroup: { marginBottom: SPACING.l },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 }, // Added Error Style
  forgotText: { textAlign: "right", fontWeight: "600", marginBottom: SPACING.l },
  button: { paddingVertical: 18, borderRadius: 12, alignItems: "center", ...SHADOWS.small },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: SPACING.xl },
  footerText: { fontSize: 15 },
  signupText: { fontWeight: "bold", fontSize: 15 },
});