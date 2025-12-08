// screens/DashboardScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView 
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

// Mock Data for UI Testing
const MOCK_ORDERS = [
  { id: '1', items: '2x Jollof Rice, 1x Chicken', price: 5000, status: 'PENDING', time: '2 mins ago' },
  { id: '2', items: '1x Fried Rice, 1x Coke', price: 2500, status: 'PREPARING', time: '15 mins ago' },
  { id: '3', items: '3x Burger', price: 9000, status: 'PENDING', time: '1 min ago' },
];

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PREPARING'>('PENDING');
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Filter orders based on the tab
  const filteredOrders = orders.filter(o => o.status === activeTab);

  // --- ACTIONS (API Calls would go here) ---
  const handleAccept = (id: string) => {
    // API: PATCH /api/orders/{id}/status { status: 'PREPARING' }
    updateLocalStatus(id, 'PREPARING');
  };

  const handleReject = (id: string) => {
    // API: PATCH /api/orders/{id}/status { status: 'CANCELLED' }
    // Remove from list locally
    setOrders((prev: any[]) => prev.filter(o => o.id !== id));
    alert('Order Rejected & Refunded');
  };

  const handleCallRider = (id: string) => {
    // API: PATCH /api/orders/{id}/status { status: 'OUT_FOR_DELIVERY' }
    setOrders((prev: any[]) => prev.filter(o => o.id !== id)); // Remove from "In Kitchen"
    alert('Rider Notified for Pickup!');
  };

  const updateLocalStatus = (id: string, status: string) => {
    setOrders((prev: any[]) => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // --- RENDER ITEM ---
  const renderOrder = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.items}>{item.items}</Text>
      <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>

      <View style={styles.actionRow}>
        {item.status === 'PENDING' ? (
          <>
            <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleReject(item.id)}>
              <Text style={[styles.btnText, { color: COLORS.danger }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={() => handleAccept(item.id)}>
              <Text style={[styles.btnText, { color: COLORS.white }]}>Accept Order</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnCallRider]} onPress={() => handleCallRider(item.id)}>
            <Text style={[styles.btnText, { color: COLORS.white }]}>Call Rider (Ready)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Command Center</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'PENDING' && styles.activeTab]} 
          onPress={() => setActiveTab('PENDING')}
        >
          <Text style={[styles.tabText, activeTab === 'PENDING' && styles.activeTabText]}>New Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'PREPARING' && styles.activeTab]} 
          onPress={() => setActiveTab('PREPARING')}
        >
          <Text style={[styles.tabText, activeTab === 'PREPARING' && styles.activeTabText]}>In Kitchen</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: SPACING.m }}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders here right now.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { padding: SPACING.m, backgroundColor: COLORS.white },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  tabs: { flexDirection: 'row', padding: SPACING.s, backgroundColor: COLORS.white },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontWeight: '600', color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },
  
  card: { backgroundColor: COLORS.white, padding: SPACING.m, borderRadius: 12, marginBottom: SPACING.m, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.s },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  time: { color: COLORS.textLight, fontSize: 12 },
  items: { fontSize: 16, color: COLORS.text, marginBottom: SPACING.s },
  price: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: SPACING.m },
  
  actionRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnReject: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: COLORS.danger },
  btnAccept: { backgroundColor: COLORS.success },
  btnCallRider: { backgroundColor: COLORS.primary }, // Blue/Primary for "Call Rider"
  btnText: { fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textLight }
});