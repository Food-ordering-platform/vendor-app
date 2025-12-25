import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '../constants/theme';
import { useQuery } from '@tanstack/react-query';
import api from '../services/axios'; // Your axios instance
import { useAuth } from '../context/authContext';
import { Ionicons } from '@expo/vector-icons';

// Fetch Function
const fetchEarnings = async (restaurantId: string) => {
  const res = await api.get(`/restaurants/${restaurantId}/earnings`);
  return res.data;
};

export default function EarningsScreen() {
  const { user } = useAuth();
  const restaurantId = user?.restaurant?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['earnings', restaurantId],
    queryFn: () => fetchEarnings(restaurantId),
    enabled: !!restaurantId
  });

  const available = data?.availableBalance || 0;
  const pending = data?.pendingBalance || 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
      </View>

      {/* --- AVAILABLE BALANCE CARD (Green) --- */}
      <View style={[styles.card, styles.availableCard]}>
        <View>
          <Text style={styles.cardLabelLight}>Withdrawable Balance</Text>
          <Text style={styles.amountLight}>₦{available.toLocaleString()}</Text>
        </View>
        <Ionicons name="wallet" size={32} color="#fff" />
      </View>

      {/* --- PENDING BALANCE CARD (Orange) --- */}
      <View style={[styles.card, styles.pendingCard]}>
        <View>
          <Text style={styles.cardLabelDark}>Pending Clearance</Text>
          <Text style={styles.amountDark}>₦{pending.toLocaleString()}</Text>
          <Text style={styles.note}>
            *Funds move to withdrawable after delivery
          </Text>
        </View>
        <Ionicons name="time" size={32} color={COLORS.primary} />
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <Text style={{ color: '#888', marginTop: 10 }}>No withdrawals yet.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  availableCard: { backgroundColor: '#10B981' }, // Green
  pendingCard: { backgroundColor: '#FFF3CD', borderWidth: 1, borderColor: '#FFC107' }, // Light Orange
  
  cardLabelLight: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  amountLight: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  
  cardLabelDark: { color: '#856404', fontSize: 14, marginBottom: 4 },
  amountDark: { color: '#856404', fontSize: 32, fontWeight: 'bold' },
  note: { color: '#856404', fontSize: 10, marginTop: 5, fontStyle: 'italic' },

  historySection: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' }
});