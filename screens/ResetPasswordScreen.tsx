import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/themeContext';
import { SPACING, SHADOWS } from '../constants/theme';
import { useResetPassword } from '../services/auth/auth.queries';

export default function ResetPasswordScreen({ route, navigation }: any) {
  const { resetToken } = route.params;
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const { mutate: reset, isPending } = useResetPassword();

  const handleReset = () => {
    if (!password || password.length < 6) return Alert.alert("Error", "Password too short");
    if (password !== confirm) return Alert.alert("Error", "Passwords do not match");

    reset({ token: resetToken, newPassword: password, confirmPassword: confirm }, {
      onSuccess: () => {
        Alert.alert("Success", "Password reset! Please log in.");
        navigation.popToTop(); // Go back to Onboarding/Login
        navigation.replace('Login');
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>New Password</Text>
        
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textLight}
            />
        </View>
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="••••••••"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholderTextColor={colors.textLight}
            />
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleReset} disabled={isPending}>
          {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
// reuse styles...
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: SPACING.xl },
  inputGroup: { marginBottom: SPACING.l },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  button: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', ...SHADOWS.small },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});