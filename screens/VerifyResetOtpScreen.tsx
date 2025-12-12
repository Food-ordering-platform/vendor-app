import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/themeContext';
import { SPACING, SHADOWS } from '../constants/theme';
import { useVerifyResetOtp } from '../services/auth/auth.queries';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyResetOtpScreen({ route, navigation }: any) {
  const { email, tempToken } = route.params;
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  
  const { mutate: verify, isPending } = useVerifyResetOtp();

  const handleVerify = () => {
    const cleanCode = code.trim();
    if (cleanCode.length < 6) return Alert.alert("Error", "Enter 6-digit code");

    verify({ token: tempToken, code: cleanCode }, {
      onSuccess: (data : any) => {
        // Backend returns { message, resetToken }
        navigation.navigate('ResetPassword', { resetToken: data.resetToken });
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Enter Code</Text>
        <Text style={[styles.subText, { color: colors.textLight }]}>Code sent to {email}</Text>
        
        <View style={styles.inputGroup}>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={7}
              autoFocus
              placeholderTextColor={colors.textLight}
            />
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleVerify} disabled={isPending}>
          {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
// Styles same as others...
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: SPACING.xs },
  subText: { fontSize: 16, marginBottom: SPACING.xl },
  inputGroup: { marginBottom: SPACING.l },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 24, textAlign: 'center', letterSpacing: 5 },
  button: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', ...SHADOWS.small },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});