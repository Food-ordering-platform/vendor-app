// screens/EarningsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

export default function EarningsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>₦ 145,000.00</Text>
          </View>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawText}>Withdraw</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.transactionItem}>
            <View style={styles.iconBox}>
              <Ionicons name="checkmark" size={18} color={COLORS.success} />
            </View>
            <View style={styles.transDetails}>
              <Text style={styles.transTitle}>Order Payout #{1020 + i}</Text>
              <Text style={styles.transDate}>Today, {2 + i}:00 PM</Text>
            </View>
            <Text style={styles.transAmount}>+₦5,000</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { padding: SPACING.l, backgroundColor: COLORS.white },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  
  balanceCard: { margin: SPACING.m, padding: SPACING.l, backgroundColor: COLORS.primary, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.medium },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  balanceValue: { color: COLORS.white, fontSize: 28, fontWeight: 'bold' },
  withdrawBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
  withdrawText: { color: COLORS.primary, fontWeight: 'bold', marginRight: 4, fontSize: 12 },
  
  sectionTitle: { marginLeft: SPACING.m, marginTop: SPACING.l, marginBottom: SPACING.s, fontSize: 16, fontWeight: '700', color: COLORS.text },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, backgroundColor: COLORS.white, marginHorizontal: SPACING.m, marginBottom: SPACING.s, borderRadius: 12, ...SHADOWS.small },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
  transDetails: { flex: 1 },
  transTitle: { fontWeight: '600', color: COLORS.text, fontSize: 14 },
  transDate: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  transAmount: { fontWeight: 'bold', color: COLORS.success, fontSize: 16 }
});