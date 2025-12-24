import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useVerifyOtp } from '../services/auth/auth.queries';
import { useTheme } from '../context/themeContext';
import { SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyOtpScreen({ route, navigation }: any) {
  const { email, token: tempToken } = route.params; 
  const { colors } = useTheme();
  
  const [code, setCode] = useState('');

  const { mutate: verify, isPending } = useVerifyOtp();

  const handleVerify = () => {
    const cleanCode = code.trim();

    if (!cleanCode || cleanCode.length < 6) {
      Alert.alert("Invalid Input", "Please enter the full 6-digit code.");
      return;
    }

    verify(
      { token: tempToken, code: cleanCode },
      {
        onSuccess: () => {
          // [FIX] DO NOT NAVIGATE HERE.
          // The query hook calls setAuth().
          // App.tsx detects the change and automatically shows the Profile Screen.
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

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
              maxLength={8}
              autoFocus
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleVerify}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.textLight, textAlign: 'center' }}>
              Code expired? <Text style={{ fontWeight: 'bold', color: colors.primary }}>Request a new one</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  header: { marginBottom: SPACING.xl, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING.s },
  subText: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  form: { width: '100%' },
  inputGroup: { marginBottom: SPACING.l },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 24, textAlign: 'center', letterSpacing: 5,
  },
  button: {
    paddingVertical: 18, borderRadius: 12, alignItems: 'center', ...SHADOWS.small,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});