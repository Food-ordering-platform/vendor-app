// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // API Call goes here
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.appName}>ChowEasy</Text>
          <Text style={styles.tagline}>Vendor Partner App</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Manage your kitchen efficiently</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input}
              placeholder="vendor@choweasy.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: SPACING.l },
  headerContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.m,
    ...SHADOWS.medium
  },
  logoText: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  appName: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  tagline: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.xs },
  
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.l,
    ...SHADOWS.medium
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  subText: { fontSize: 14, color: COLORS.textLight, marginBottom: SPACING.l },
  inputGroup: { marginBottom: SPACING.m },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: SPACING.s,
    ...SHADOWS.small
  },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  forgotBtn: { alignItems: 'center', marginTop: SPACING.m },
  forgotText: { color: COLORS.primary, fontWeight: '600' }
});