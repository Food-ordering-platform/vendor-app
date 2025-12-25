import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useGetEarnings } from '../services/restaurant/restaurant.queries';
import { useTheme } from '../context/themeContext'; // 👈 Theme Hook
import HeaderTemp from '../components/HeaderTemp';   // 👈 Consistent Header
import { SPACING, SHADOWS } from '../constants/theme'; // 👈 Theme Constants

export default function EarningsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme(); // Get dynamic colors
  const restaurantId = user?.restaurant?.id;

  const { data, isLoading, refetch } = useGetEarnings(restaurantId || "");
  const earnings = data?.data;
  
  const available = earnings?.availableBalance || 0;
  const pending = earnings?.pendingBalance || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Use the App's Standard Header */}
      <HeaderTemp title="Earnings" subtitle="Financial Overview" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refetch} 
            tintColor={colors.primary} // Red spinner
          />
        }
      >
        {/* --- AVAILABLE BALANCE CARD (Primary Red Brand Color) --- */}
        <View style={[
          styles.card, 
          { backgroundColor: colors.primary } // Uses your 'RedPrimary'
        ]}>
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

        {/* --- PENDING BALANCE CARD (Secondary Amber Theme) --- */}
        <View style={[
          styles.card, 
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.secondary, // Amber Border
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
            { backgroundColor: isDark ? 'rgba(255, 193, 7, 0.15)' : '#FFF8E1' } // Light Amber bg
          ]}>
            <Ionicons name="time" size={24} color={colors.secondary} />
          </View>
        </View>

        {/* --- TRANSACTION HISTORY --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transaction History
          </Text>
          
          {/* Empty State consistent with theme */}
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.textLight }}>No withdrawals yet.</Text>
          </View>
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
    ...SHADOWS.medium, // Use your app's shadow
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

  section: { marginTop: SPACING.m },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.s },
  emptyState: {
    padding: SPACING.l,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center'
  }
});