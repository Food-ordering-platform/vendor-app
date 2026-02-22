// screens/SignupScreen.tsx

import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✅ CORRECT IMPORT: Use the Context, not the Query directly
import { useAuth } from '../context/authContext';
import { COLORS } from '../constants/theme';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  
  // ✅ Access register function and loading state from Context
  // (Assuming your AuthContext exposes 'register' and 'isLoading' or 'isRegistering')
  // If your context only exposes { register }, we use local loading state.
  const { register } = useAuth(); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
  name: '',
    email: '',
    password: '',
    phone: '',
    restaurantName: '',
    role: 'VENDOR' as const, // 👈 THE FIX: Forces type to be "VENDOR" instead of string
    terms: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // 1. Basic Validation
    if (!formData.name || !formData.email || !formData.password || !formData.restaurantName) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    if (!formData.terms) {
      Alert.alert("Terms Required", "Please accept the terms and conditions.");
      return;
    }

    setLoading(true);
    try {
      // 2. Call Register from Context
      // This assumes register(data) returns a Promise. 
      // If your backend sends an OTP, we navigate to VerifyOtp after success.
      await register(formData);
      
      setLoading(false);
      Alert.alert("Success", "Account created! Please verify your email.");
      navigation.navigate('VerifyOtp', { email: formData.email });

    } catch (error: any) {
      setLoading(false);
      const msg = error.response?.data?.message || error.message || "Registration failed";
      Alert.alert("Error", msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* ✅ FIX FOR SHAKING / TWITCHING:
         - Android: behavior={undefined} (Let the OS resize naturally)
         - iOS: behavior="padding" (Push content up)
      */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
               <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start selling on ChowEazy today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            {/* Restaurant Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Restaurant Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mama Put"
                placeholderTextColor="#999"
                value={formData.restaurantName}
                onChangeText={(text) => setFormData({...formData, restaurantName: text})}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="vendor@example.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="08012345678"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
            </View>

             {/* Address */}
             {/* <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Street, City, State"
                placeholderTextColor="#999"
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
              />
            </View> */}

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity 
                onPress={() => setFormData({...formData, terms: !formData.terms})}
                style={styles.checkboxRow}
              >
                <Ionicons 
                  name={formData.terms ? "checkbox" : "checkbox-outline"} 
                  size={20} 
                  color={COLORS.primary || '#000'} 
                />
                <Text style={styles.termsText}>I agree to the Terms and Conditions</Text>
              </TouchableOpacity>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 50, // Extra space at bottom
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
    padding: 4, 
    marginLeft: -4
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: COLORS.primary || '#000', // Fallback to black if theme fails
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: COLORS.primary || '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});