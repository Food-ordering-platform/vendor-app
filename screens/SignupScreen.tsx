// screens/SignupScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { useRegister } from '@/services/auth/auth.queries';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const {mutate:register, isPending} = useRegister()

  const handleSignup = () => {
   if(!name || !email || !phone ||!password){
    alert("Please fill all fields")
    return;
   }
   register({
    name, email, password, phone, role:'VENDOR'},{
      onSuccess:(data) => {
        //Navigate to verifyOTP passing token and email
        navigation.navigate('VerifyOtp', {
          token:data.token,
          email:email
        })
      }
    })
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subText}>Join thousands of vendors growing with ChowEasy.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Email</Text>
              <TextInput 
                style={styles.input}
                placeholder="kitchen@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput 
                style={styles.input}
                placeholder="080..."
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input}
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Continue</Text>
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
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.m,
    ...SHADOWS.small,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textLight, fontSize: 15 },
  loginText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
});