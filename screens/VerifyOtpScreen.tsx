import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useVerifyOtp } from '../services/auth/auth.queries';
import { useAuth } from '../context/authContext';

export default function VerifyOtpScreen({ navigation, route }: any) {
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  
  const { mutateAsync: verifyOtp, isPending } = useVerifyOtp();
  const { refreshUser } = useAuth(); 

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      Alert.alert("Invalid Code", "Please enter the valid OTP sent to your email.");
      return;
    }

    if (!email) {
      Alert.alert("Email is Missing");
      // navigation.navigate("Login");
      return 
    }

    try {
      // 1. Call Backend
      const result = await verifyOtp({
        email:email,
        code: code,
        clientType: 'mobile'
      });

      // 2. Save the FINAL access token (Platform Safe!)
      if (result.success) {
        navigation.navigate('Login');
    }
    }
     catch (error: any) {
      console.log("OTP Error handled in hook");
  }
}

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subText}>
            We&apos;ve sent a verification code to{"\n"}
            <Text style={styles.emailText}>{email || "your email"}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>OTP Code</Text>
          <TextInput 
            style={styles.input}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            placeholderTextColor={COLORS.textLight}
          />

          <TouchableOpacity 
            style={[styles.button, isPending && { opacity: 0.7 }]} 
            onPress={handleVerify}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Didn&apos;t receive code? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: SPACING.l, zIndex: 10 },
  
  header: { marginBottom: SPACING.xl, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.s },
  subText: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
  emailText: { color: COLORS.text, fontWeight: '700' },

  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    color: COLORS.text,
  },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.small,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textLight, fontSize: 15 },
  linkText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
});

