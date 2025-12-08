// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView 
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.brandText}>ChowEasy</Text>
          <Text style={styles.welcomeText}>Welcome back, Partner</Text>
          <Text style={styles.subText}>Sign in to manage your kitchen.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input}
              placeholder="vendor@choweasy.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.textLight}
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
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <TouchableOpacity onPress={() => console.log("Forgot Password")}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to ChowEasy? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>Become a Vendor</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  
  header: { marginBottom: SPACING.xl },
  brandText: { fontSize: 24, fontWeight: '900', color: COLORS.primary, marginBottom: SPACING.s },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.xs },
  subText: { fontSize: 16, color: COLORS.textLight },

  form: { marginTop: SPACING.m },
  inputGroup: { marginBottom: SPACING.l },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  
  forgotText: { textAlign: 'right', color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.l },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textLight, fontSize: 15 },
  signupText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
});