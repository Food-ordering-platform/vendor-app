import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth/auth';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext'; // For Dark Mode support
import { SPACING, SHADOWS } from '../constants/theme';

export default function VerifyOtpScreen({ route, navigation }: any) {
  const { email, tempToken } = route.params; // Get passed data
  const { colors } = useTheme();
  const { setAuth } = useAuth();
  
  const [code, setCode] = useState('');

  // Mutation for Verification
  const verifyMutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: async (data) => {
      // ✅ Server returns the REAL token here
      await setAuth(data.user, data.token);
      
      // Navigate to Setup Profile (Onboarding flow)
      navigation.replace('Profile', { isOnboarding: true });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Invalid Code";
      Alert.alert("Verification Failed", msg);
    }
  });

  const handleVerify = () => {
    if (code.length < 4) {
      Alert.alert("Error", "Please enter the full code.");
      return;
    }
    verifyMutation.mutate({ token: tempToken, code });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Verify Email</Text>
          <Text style={[styles.subText, { color: colors.textLight }]}>
            We sent a code to <Text style={{ fontWeight: 'bold' }}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Enter Code</Text>
            <TextInput 
              style={[styles.input, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border, 
                color: colors.text 
              }]}
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              placeholderTextColor={colors.textLight}
              maxLength={6}
              autoFocus
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleVerify}
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.textLight, textAlign: 'center' }}>Wrong email? Go Back</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  header: { marginBottom: SPACING.xl, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING.s },
  subText: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  form: { width: '100%' },
  inputGroup: { marginBottom: SPACING.l },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 24, // Bigger font for OTP
    textAlign: 'center',
    letterSpacing: 5,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});