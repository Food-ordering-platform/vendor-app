import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/authContext';
// 1. Import Schema
import { signupSchema, SignupFormData } from '../utils/schema';
import { boolean } from 'zod';

export default function SignupScreen({ navigation }: any) {
  // 2. Group Form State
  const [formData, setFormData] = useState<SignupFormData>({
    name: '', email: '', phone: '', password: '', terms: false
  });
  
  // 3. Error State
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSignup = async () => {
    // 4. Validate
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      
      // Alert specifically for checkbox if it's the only error
      if (formattedErrors.terms) Alert.alert("Agreement Required", formattedErrors.terms);
      return;
    }

    try {
      setLoading(true);
      const data = await register({
        ...result.data,
        role: 'VENDOR'
      });

      navigation.navigate('VerifyOtp', {
        token: data.token,
        email: result.data.email
      });

    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subText}>Join thousands of vendors growing with ChowEasy.</Text>
          </View>

          <View style={styles.form}>
            {/* NAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="John Doe"
                value={formData.name}
                onChangeText={(t) => handleChange('name', t)}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Email</Text>
              <TextInput 
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="kitchen@example.com"
                value={formData.email}
                onChangeText={(t) => handleChange('email', t)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* PHONE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput 
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="080..."
                value={formData.phone}
                onChangeText={(t) => handleChange('phone', t)}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Create a strong password"
                value={formData.password}
                onChangeText={(t) => handleChange('password', t)}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* TERMS CHECKBOX */}
            <TouchableOpacity 
              style={styles.termsContainer} 
              onPress={() => handleChange('terms', !formData.terms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, formData.terms && styles.checkboxChecked, errors.terms && { borderColor: 'red' }]}>
                {formData.terms && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText}>Merchant Partner Agreement</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.l, paddingBottom: 50 },
  backBtn: { marginBottom: SPACING.l, marginTop: SPACING.s },
  header: { marginBottom: SPACING.l },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.xs },
  subText: { fontSize: 16, color: COLORS.textLight },
  form: { marginTop: SPACING.s },
  inputGroup: { marginBottom: SPACING.m },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: 16, fontSize: 16, color: COLORS.text,
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 12,
    alignItems: 'center', marginTop: SPACING.s, ...SHADOWS.small,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textLight, fontSize: 15 },
  loginText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, marginBottom: 20 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 4, marginRight: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: COLORS.primary },
  termsText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  linkText: { color: COLORS.primary, fontWeight: 'bold', textDecorationLine: 'underline' },
});