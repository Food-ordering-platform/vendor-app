import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useGetEarnings, useGetTransactions } from '../services/restaurant/restaurant.queries'; // 👈 Added useGetTransactions
import { useTheme } from '../context/themeContext';
import HeaderTemp from '../components/HeaderTemp';
import { SPACING, SHADOWS } from '../constants/theme';

// Helper to format date nicely
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
};

export default function EarningsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const restaurantId = user?.restaurant?.id;

  // 1. Fetch Earnings
  const { 
    data: earningsData, 
    isLoading: isLoadingEarnings, 
    refetch: refetchEarnings 
  } = useGetEarnings(restaurantId || "");

  // 2. Fetch Transactions (New)
  const { 
    data: transactionData, 
    isLoading: isLoadingTx, 
    refetch: refetchTx 
  } = useGetTransactions(restaurantId || "");

  const earnings = earningsData?.data;
  const available = earnings?.availableBalance || 0;
  const pending = earnings?.pendingBalance || 0;
  const transactions = transactionData?.data || [];

  // Combine Refresh Logic
  const onRefresh = () => {
    refetchEarnings();
    refetchTx();
  };

  const isLoading = isLoadingEarnings || isLoadingTx;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderTemp title="Earnings" subtitle="Financial Overview" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh} 
            tintColor={colors.primary}
          />
        }
      >
        {/* --- AVAILABLE BALANCE CARD --- */}
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={[styles.cardLabel, { color: 'rgba(255,255,255,0.8)' }]}>
              Withdrawable Balance
            </Text>
            <Text style={[styles.amount, { color: colors.white }]}>
              ₦{available.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="wallet" size={24} color={colors.white} />
          </View>
        </View>

        {/* --- PENDING BALANCE CARD --- */}
        <View style={[
          styles.card, 
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.secondary, 
            borderWidth: 1 
          }
        ]}>
          <View>
            <Text style={[styles.cardLabel, { color: colors.textLight }]}>
              Pending Clearance
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              ₦{pending.toLocaleString()}
            </Text>
            <Text style={[styles.note, { color: colors.secondary }]}>
              *Funds move to withdrawable after delivery
            </Text>
          </View>
          <View style={[
            styles.iconCircle, 
            { backgroundColor: isDark ? 'rgba(255, 193, 7, 0.15)' : '#FFF8E1' }
          ]}>
            <Ionicons name="time" size={24} color={colors.secondary} />
          </View>
        </View>

        {/* --- TRANSACTION HISTORY (UPDATED) --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transaction History
          </Text>
          
          {transactions.length === 0 ? (
            /* Empty State */
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: colors.textLight }}>No transactions yet.</Text>
            </View>
          ) : (
            /* Transaction List */
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden' }}>
              {transactions.map((item: any) => (
                <View key={item.id} style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
                  {/* Left Side: Info */}
                  <View style={styles.transactionLeft}>
                    <Text style={[styles.transactionTitle, { color: colors.text }]}>
                      {item.description}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textLight }]}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>

                  {/* Right Side: Amount */}
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount, 
                      { color: item.type === 'CREDIT' ? '#10B981' : '#EF4444' } // Green for In, Red for Out
                    ]}>
                      {item.type === 'CREDIT' ? '+' : '-'} ₦{item.amount.toLocaleString()}
                    </Text>
                    <Text style={[styles.transactionStatus, { color: colors.textLight }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.l },
  
  card: {
    borderRadius: 16,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  
  cardLabel: { 
    fontSize: 14, 
    marginBottom: SPACING.xs, 
    fontWeight: '600',
    letterSpacing: 0.5 
  },
  amount: { 
    fontSize: 32, 
    fontWeight: '800' 
  },
  note: { 
    fontSize: 11, 
    marginTop: SPACING.s, 
    fontStyle: 'italic',
    fontWeight: '500'
  },
  
  iconCircle: {
    width: 48, 
    height: 48, 
    borderRadius: 24,
    alignItems: 'center', 
    justifyContent: 'center'
  },

  section: { marginTop: SPACING.m, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.s },
  emptyState: {
    padding: SPACING.l,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center'
  },

  // New Styles for Transactions
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.m,
    borderBottomWidth: 1,
  },
  transactionLeft: { flex: 1, marginRight: 10 },
  transactionRight: { alignItems: 'flex-end' },
  transactionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  transactionDate: { fontSize: 12 },
  transactionAmount: { fontSize: 14, fontWeight: '700' },
  transactionStatus: { fontSize: 10, marginTop: 2, textTransform: 'uppercase' }
});