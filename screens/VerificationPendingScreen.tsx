import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';
import { useAuth } from '../context/authContext';

export default function VerificationPendingScreen() {
  const { logout, user, refreshUser } = useAuth();

  const contactSupport = () => {
    Linking.openURL('mailto:support@choweazy.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="hourglass-outline" size={60} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Verification Pending</Text>
        
        <Text style={styles.subtitle}>
          Thanks, {user?.restaurant?.name}! We&apos;ve received your application.
        </Text>

        <Text style={styles.body}>
          To ensure quality on ChowEazy, our team manually reviews every new vendor. 
          This usually takes <Text style={{fontWeight: '700'}}>24-48 hours</Text>.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            You will receive an email once your restaurant is approved and live.
          </Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={refreshUser}>
        <Text style={styles.btnText}>Check Status</Text>
      </TouchableOpacity>

        <TouchableOpacity style={styles.contactBtn} onPress={contactSupport}>
          <Text style={styles.contactText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: SPACING.l, alignItems: 'center', justifyContent: 'center' },
  iconContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.l
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.s },
  subtitle: { fontSize: 16, fontWeight: '600', color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.m },
  body: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  infoBox: {
    flexDirection: 'row', backgroundColor: COLORS.primary + '10', 
    padding: 16, borderRadius: 12, gap: 10, marginBottom: 40
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.primary, lineHeight: 18 },
  contactBtn: {
    backgroundColor: COLORS.secondary, paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 30, marginBottom: 20, width: '100%', alignItems: 'center'
  },
  contactText: { color: 'white', fontWeight: '700' },
  logoutBtn: { padding: 10 },
  logoutText: { color: COLORS.danger, fontWeight: '600' },
  btn: { backgroundColor: COLORS.primary, width: '100%', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});