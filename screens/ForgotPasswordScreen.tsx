import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/themeContext';
import { SPACING, SHADOWS } from '../constants/theme';
import { useForgotPassword } from '../services/auth/auth.queries';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSend = () => {
    if (!email) return alert("Please enter your email");
   forgotPassword({ email }, {
      onSuccess: (data) => { // data contains { message, token }
        navigation.navigate('VerifyResetOtp', { email, tempToken: data.token });
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
        <Text style={[styles.subText, { color: colors.textLight }]}>
          Enter your email address and we will send you a code to reset your password.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="vendor@choweasy.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={handleSend}
          disabled={isPending}
        >
          {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: SPACING.xs },
  subText: { fontSize: 16, marginBottom: SPACING.xl },
  inputGroup: { marginBottom: SPACING.l },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  button: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', ...SHADOWS.small },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});