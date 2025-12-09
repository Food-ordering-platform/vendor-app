import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, Image 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/themeContext';
import { SPACING, SHADOWS } from '../constants/theme';

export default function LoginScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          {/* ✅ Logo Replaces Text Header */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome back, Partner</Text>
          <Text style={[styles.subText, { color: colors.textLight }]}>Sign in to manage your kitchen.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="vendor@choweasy.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textLight}
            />
          </View>

          <TouchableOpacity onPress={() => console.log("Forgot Password")}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>New to ChowEasy? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.signupText, { color: colors.primary }]}>Become a Vendor</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  
  header: { marginBottom: SPACING.xl, alignItems: 'center' }, // Centered Header
  
  // New Logo Styles
  logoContainer: {
    marginBottom: SPACING.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 100, // Nice medium size
    height: 100,
    borderRadius: 20, // Matches the splash screen curve slightly
  },

  welcomeText: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING.xs, textAlign: 'center' },
  subText: { fontSize: 16, textAlign: 'center' },

  form: { marginTop: SPACING.m },
  inputGroup: { marginBottom: SPACING.l },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  
  forgotText: { textAlign: 'right', fontWeight: '600', marginBottom: SPACING.l },
  
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { fontSize: 15 },
  signupText: { fontWeight: 'bold', fontSize: 15 },
});