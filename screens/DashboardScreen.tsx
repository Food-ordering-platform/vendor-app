// screens/DashboardScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

const MOCK_ORDERS = [
  { id: '1023', items: '2x Jollof Rice, 1x Grilled Chicken', price: 5000, status: 'PENDING', time: '2 mins ago', customer: 'John Doe' },
  { id: '1022', items: '1x Fried Rice, 1x Coke', price: 2500, status: 'PREPARING', time: '15 mins ago', customer: 'Sarah S.' },
  { id: '1021', items: '3x Beef Burger', price: 9000, status: 'PENDING', time: '5 mins ago', customer: 'Mike T.' },
];

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PREPARING'>('PENDING');
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const filteredOrders = orders.filter(o => o.status === activeTab);

  const renderOrder = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.customerName}>{item.customer}</Text>
        </View>
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      
      <Text style={styles.items}>{item.items}</Text>
      <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>

      <View style={styles.actionRow}>
        {item.status === 'PENDING' ? (
          <>
            <TouchableOpacity style={[styles.btn, styles.btnReject]}>
              <Text style={styles.btnRejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnAccept]}
              onPress={() => alert("Accepted!")}
            >
              <Text style={styles.btnAcceptText}>Accept Order</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnReady]}>
            <Ionicons name="bicycle" size={18} color="white" style={{marginRight: 8}} />
            <Text style={styles.btnReadyText}>Call Rider (Ready)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Good Afternoon,</Text>
          <Text style={styles.headerTitle}>ChowEasy Command</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('PENDING')}
        >
          <Text style={[styles.tabText, activeTab === 'PENDING' && styles.activeTabText]}>New Orders</Text>
          {activeTab === 'PENDING' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('PREPARING')}
        >
          <Text style={[styles.tabText, activeTab === 'PREPARING' && styles.activeTabText]}>In Kitchen</Text>
          {activeTab === 'PREPARING' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.l, backgroundColor: COLORS.white },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  headerSubtitle: { fontSize: 14, color: COLORS.textLight },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 6 },
  statusText: { color: COLORS.success, fontWeight: '700', fontSize: 12 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabText: { fontWeight: '600', color: COLORS.textLight, fontSize: 14 },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
  activeIndicator: { position: 'absolute', bottom: 0, height: 3, width: '40%', backgroundColor: COLORS.primary, borderRadius: 3 },
  
  listContent: { padding: SPACING.m },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  customerName: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginLeft: 4 },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.m },
  items: { fontSize: 16, color: COLORS.text, fontWeight: '500', marginBottom: SPACING.s },
  price: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: SPACING.m },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  btnReject: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  btnRejectText: { color: COLORS.danger, fontWeight: '700' },
  btnAccept: { backgroundColor: COLORS.success },
  btnAcceptText: { color: COLORS.white, fontWeight: '700' },
  btnReady: { backgroundColor: COLORS.primary },
  btnReadyText: { color: COLORS.white, fontWeight: '700' },
  
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: COLORS.textLight, fontSize: 16 }
});