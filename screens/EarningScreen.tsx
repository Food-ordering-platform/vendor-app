import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SPACING, SHADOWS } from "../constants/theme";
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/HeaderTemp';
import { useTheme } from '../context/themeContext';

const TRANSACTIONS = [
  { id: '1', amount: 5000, date: '2023-10-26', type: 'ORDER', desc: 'Order #1025' },
  { id: '2', amount: 2500, date: '2023-10-26', type: 'ORDER', desc: 'Order #1024' },
  { id: '3', amount: 12000, date: '2023-10-25', type: 'ORDER', desc: 'Order #1023' },
  { id: '4', amount: -50000, date: '2023-10-20', type: 'WITHDRAWAL', desc: 'Bank Transfer' },
  { id: '5', amount: 8000, date: '2023-10-15', type: 'ORDER', desc: 'Order #1010' },
];

export default function EarningsScreen() {
  const { colors, isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  const calculateTotals = () => {
    return {
      daily: 7500,
      weekly: 45000,
      monthly: 145000,
      totalBalance: 145000
    };
  };

  const totals = calculateTotals();

  const StatCard = ({ label, value, active }: any) => (
    <TouchableOpacity 
      style={[
        styles.statCard, 
        { 
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
          borderWidth: 1
        }
      ]}
      onPress={() => setViewMode(label.toUpperCase())}
    >
      <Text style={[styles.statLabel, { color: active ? 'white' : colors.textLight }]}>{label}</Text>
      <Text style={[styles.statValue, { color: active ? 'white' : colors.text }]}>₦{value.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Financials" subtitle="Overview" showNotification={false} />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* 1. MAIN BALANCE CARD */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.balanceLabel}>Withdrawable Balance</Text>
            <Text style={styles.balanceValue}>₦ {totals.totalBalance.toLocaleString()}.00</Text>
          </View>
          <TouchableOpacity style={[styles.withdrawBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.withdrawText, { color: 'white' }]}>Withdraw</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* 2. STATS ROW */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
        
        <View style={styles.statsRow}>
          <StatCard label="Daily" value={totals.daily} active={viewMode === 'DAILY'} />
          <StatCard label="Weekly" value={totals.weekly} active={viewMode === 'WEEKLY'} />
          <StatCard label="Monthly" value={totals.monthly} active={viewMode === 'MONTHLY'} />
        </View>

        {/* 3. CHART PLACEHOLDER (FIXED) */}
        <View style={[styles.chartPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textLight }}>{viewMode} Earnings Chart</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 50, gap: 8, marginTop: 10 }}>
            {/* Fake bars */}
            {[40, 70, 30, 90, 50, 80, 60].map((h, i) => (
              <View 
                key={i} 
                style={{ 
                  width: 8, 
                  height: `${h}%` as any, // 👈 THE FIX: Added "as any" to satisfy TypeScript
                  backgroundColor: colors.primary, 
                  borderRadius: 4, 
                  opacity: 0.7 
                }} 
              />
            ))}
          </View>
        </View>

        {/* 4. TRANSACTION HISTORY */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: SPACING.l }]}>Recent Transactions</Text>
        
        {TRANSACTIONS.map((item) => (
          <View key={item.id} style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBox, { 
              backgroundColor: item.type === 'WITHDRAWAL' ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2') : (isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7') 
            }]}>
              <Ionicons 
                name={item.type === 'WITHDRAWAL' ? "arrow-up" : "arrow-down"} 
                size={18} 
                color={item.type === 'WITHDRAWAL' ? colors.danger : colors.success} 
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[styles.transTitle, { color: colors.text }]}>{item.desc}</Text>
              <Text style={[styles.transDate, { color: colors.textLight }]}>{item.date}</Text>
            </View>
            
            <Text style={[styles.transAmount, { color: item.type === 'WITHDRAWAL' ? colors.danger : colors.success }]}>
              {item.amount > 0 ? '+' : ''}₦{Math.abs(item.amount).toLocaleString()}
            </Text>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceCard: { margin: SPACING.m, padding: SPACING.l, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.medium },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  balanceValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  withdrawBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
  withdrawText: { fontWeight: 'bold', marginRight: 4, fontSize: 12 },
  sectionTitle: { marginLeft: SPACING.m, marginTop: SPACING.m, fontSize: 16, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.m, gap: 10, marginTop: 10 },
  statCard: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  chartPlaceholder: { margin: SPACING.m, padding: SPACING.m, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, marginHorizontal: SPACING.m, marginBottom: SPACING.s, borderRadius: 12, ...SHADOWS.small },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
  transTitle: { fontWeight: '600', fontSize: 14 },
  transDate: { fontSize: 12, marginTop: 2 },
  transAmount: { fontWeight: 'bold', fontSize: 16 }
});