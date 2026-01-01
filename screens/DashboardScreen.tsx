import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/themeContext";
import { useAuth } from "../context/authContext";
import { LinearGradient } from 'expo-linear-gradient';

// --- API & TYPES ---
import { useGetVendorOrders, useUpdateOrderStatus } from "../services/order/order.queries";
import { Order, OrderStatus } from "../types/order.types";

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const restaurantId = user?.restaurant?.id;

  // --- 1. DATA FETCHING ---
  const { 
    data: ordersResponse, 
    isLoading, 
    refetch,
    isRefetching 
  } = useGetVendorOrders(restaurantId || "");

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  // --- 2. UI STATE ---
  const [activeTab, setActiveTab] = useState<"PENDING" | "PREPARING" | "HISTORY">("PENDING");
  
  const orders = ordersResponse?.data || [];

  // --- 3. FILTER LOGIC ---
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab === "PENDING") {
        return o.status === "PENDING";
      }
      if (activeTab === "PREPARING") {
        return o.status === "PREPARING";
      }
      if (activeTab === "HISTORY") {
        return ["DELIVERED", "CANCELLED", "REFUNDED", "OUT_FOR_DELIVERY"].includes(o.status);
      }
      return false;
    });
  }, [orders, activeTab]);

  // --- 4. HANDLERS ---
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateStatus({ orderId, status: newStatus });
  };

  const formatItems = (items: Order['items']) => {
    return items.map(i => `${i.quantity}x ${i.menuItemName}`).join(", ");
  };

  // --- 5. RENDER COMPONENTS ---

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface }]}>
      {/* Gradient Overlay for depth */}
      <View style={styles.headerContent}>
        {/* Top Section */}
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.textLight }]}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </Text>
            <Text style={[styles.restaurantName, { color: colors.text }]}>
              {user?.restaurant?.name || "My Kitchen"}
            </Text>
          </View>
          
          <View style={[styles.onlineIndicator, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.onlineText, { color: colors.success }]}>Live</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FFF' }]}>
            <View style={[styles.statIconBox, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="timer-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.statTextBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {orders.filter(o => o.status === 'PENDING').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>New Orders</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FFF' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B15' }]}>
              <Ionicons name="flame-outline" size={20} color="#F59E0B" />
            </View>
            <View style={styles.statTextBox}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {orders.filter(o => o.status === 'PREPARING').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>In Kitchen</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    // Status Badge Configuration
    let statusConfig = {
      color: colors.textLight,
      bg: isDark ? '#374151' : '#F3F4F6',
      icon: 'time-outline' as any
    };
    
    if (item.status === 'PENDING') { 
      statusConfig = { color: colors.primary, bg: colors.primary + '15', icon: 'alert-circle-outline' };
    }
    if (item.status === 'PREPARING') { 
      statusConfig = { color: '#F59E0B', bg: '#F59E0B15', icon: 'flame-outline' };
    }
    if (item.status === 'OUT_FOR_DELIVERY') { 
      statusConfig = { color: colors.success, bg: colors.success + '15', icon: 'bicycle-outline' };
    }
    if (item.status === 'CANCELLED') { 
      statusConfig = { color: colors.danger, bg: colors.danger + '15', icon: 'close-circle-outline' };
    }

    return (
      <View style={[styles.orderCard, { backgroundColor: colors.surface }]}>
        {/* Card Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdSection}>
            <View style={[styles.orderIconBox, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon} size={18} color={statusConfig.color} />
            </View>
            <View>
              <Text style={[styles.orderId, { color: colors.text }]}>
                #{item.reference ? item.reference.slice(0, 6).toUpperCase() : item.id.slice(0, 6)}
              </Text>
              <Text style={[styles.customerName, { color: colors.textLight }]}>
                {item.customer?.name || "Guest Customer"}
              </Text>
            </View>
          </View>
          
          <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusPillText, { color: statusConfig.color }]}>
              {item.status.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.itemsSection, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
          <Ionicons name="restaurant-outline" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
          <Text style={[styles.orderItems, { color: colors.text }]}>
            {formatItems(item.items)}
          </Text>
        </View>

        {/* Special Instructions */}
        {item.deliveryNotes && (
          <View style={[styles.notesBox, { 
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
            borderColor: isDark ? '#B45309' : '#FCD34D'
          }]}>
            <View style={styles.notesHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={14} color={isDark ? '#FCD34D' : '#D97706'} />
              <Text style={[styles.notesLabel, { color: isDark ? '#FCD34D' : '#D97706' }]}>
                Special Request
              </Text>
            </View>
            <Text style={[styles.notesText, { color: isDark ? '#E5E7EB' : '#4B5563' }]}>
              &quot;{item.deliveryNotes}&quot;
            </Text>
          </View>
        )}
        
        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textLight }]}>Order Total</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              ₦{item.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {activeTab !== 'HISTORY' && (
          <View style={styles.actionButtons}>
            {item.status === "PENDING" ? (
              <>
                <TouchableOpacity 
                  disabled={isUpdating}
                  style={[styles.actionBtn, styles.rejectBtn, { borderColor: colors.danger }]}
                  onPress={() => handleStatusUpdate(item.id, "CANCELLED")}
                >
                  <Ionicons name="close" size={18} color={colors.danger} />
                  <Text style={[styles.actionBtnText, { color: colors.danger }]}>Decline</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  disabled={isUpdating}
                  style={[styles.actionBtn, styles.acceptBtn, { backgroundColor: colors.success }]}
                  onPress={() => handleStatusUpdate(item.id, "PREPARING")}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={[styles.actionBtnText, { color: "white" }]}>Accept</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.riderBtn, { backgroundColor: colors.primary }]}
                disabled={isUpdating} 
                onPress={() => handleStatusUpdate(item.id, "OUT_FOR_DELIVERY")}
              >
                <Ionicons name="bicycle" size={18} color="white" />
                <Text style={[styles.actionBtnText, { color: "white" }]}>Call Rider</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // --- MAIN RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
        {renderHeader()}
      </SafeAreaView>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        {[
          { key: 'PENDING', label: 'New', icon: 'notifications-outline' },
          { key: 'PREPARING', label: 'Kitchen', icon: 'flame-outline' },
          { key: 'HISTORY', label: 'History', icon: 'archive-outline' }
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.key} 
            onPress={() => setActiveTab(tab.key as any)}
            style={[
              styles.tab,
              activeTab === tab.key && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? colors.primary : colors.textLight} 
            />
            <Text style={[
              styles.tabText, 
              { color: activeTab === tab.key ? colors.primary : colors.textLight }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      {isLoading && !orders.length ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={refetch} 
              tintColor={colors.primary} 
              colors={[colors.primary]} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons 
                  name={activeTab === 'PENDING' ? "checkmark-done-outline" : "archive-outline"} 
                  size={48} 
                  color={colors.primary} 
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeTab === 'HISTORY' ? "No past orders" : "All caught up!"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>
                {activeTab === 'HISTORY' 
                  ? "Completed orders will appear here" 
                  : "New orders will show up here"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header Styles
  headerContainer: { 
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  headerContent: { paddingHorizontal: 20, paddingTop: 10 },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20
  },
  greeting: { 
    fontSize: 13, 
    fontWeight: '600', 
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4 
  },
  restaurantName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  onlineIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5
  },
  onlineDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 6 
  },
  onlineText: { fontSize: 13, fontWeight: '700' },
  
  // Stats Cards
  statsContainer: { flexDirection: 'row', gap: 12 },
  statCard: { 
    flex: 1, 
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  statTextBox: { justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  
  // Tab Bar
  tabBar: { 
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTab: {},
  tabText: { fontSize: 14, fontWeight: '700' },
  
  // Order Card
  listContent: { padding: 16, paddingBottom: 32 },
  orderCard: { 
    borderRadius: 20, 
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 14
  },
  orderIdSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  orderIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  orderId: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  customerName: { fontSize: 13, fontWeight: '500' },
  statusPill: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10
  },
  statusPillText: { 
    fontSize: 11, 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  
  // Items Section
  itemsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12
  },
  orderItems: { 
    fontSize: 14, 
    fontWeight: '600',
    lineHeight: 20,
    flex: 1
  },
  
  // Notes Box
  notesBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 14
  },
  notesHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  notesLabel: { 
    fontSize: 11, 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6
  },
  notesText: { 
    fontSize: 13, 
    lineHeight: 18,
    fontStyle: 'italic'
  },
  
  // Price Section
  priceSection: { marginBottom: 14 },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  priceLabel: { fontSize: 13, fontWeight: '600' },
  priceValue: { fontSize: 22, fontWeight: '800' },
  
  // Action Buttons
  actionButtons: { flexDirection: 'row', gap: 10 },
  actionBtn: { 
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  rejectBtn: { 
    borderWidth: 2,
    backgroundColor: 'transparent'
  },
  acceptBtn: {},
  riderBtn: {},
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  
  // Empty State
  emptyState: { 
    alignItems: 'center', 
    marginTop: 100,
    paddingHorizontal: 40
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: { 
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22
  }
});