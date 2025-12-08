// screens/EarningsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function EarningsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>₦ 145,000.00</Text>
        <View style={styles.withdrawBtn}>
          <Text style={styles.withdrawText}>Withdraw Funds</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      
      {/* Mock List */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.transactionItem}>
          <View style={styles.iconBox}>
            <Ionicons name="arrow-down" size={20} color={COLORS.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.transTitle}>Order Payout #{100 + i}</Text>
            <Text style={styles.transDate}>Today, 2:30 PM</Text>
          </View>
          <Text style={styles.transAmount}>+₦5,000</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { padding: SPACING.l, backgroundColor: COLORS.white },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  balanceCard: { margin: SPACING.m, padding: SPACING.l, backgroundColor: COLORS.primary, borderRadius: 20 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  balanceValue: { color: COLORS.white, fontSize: 32, fontWeight: 'bold', marginVertical: SPACING.s },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 20, alignSelf: 'flex-start' },
  withdrawText: { color: COLORS.white, marginRight: 5, fontWeight: '600' },
  sectionTitle: { marginLeft: SPACING.m, marginTop: SPACING.m, fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, backgroundColor: COLORS.white, marginHorizontal: SPACING.m, marginTop: SPACING.s, borderRadius: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
  transTitle: { fontWeight: '600', color: COLORS.text },
  transDate: { fontSize: 12, color: COLORS.textLight },
  transAmount: { fontWeight: 'bold', color: COLORS.success, fontSize: 16 }
});