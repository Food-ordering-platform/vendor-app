import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/themeContext";
import { useAuth } from "../context/authContext";
import { useOrderNotification } from "../hooks/useOrderNotification";

// --- API & TYPES ---
import { useGetVendorOrders, useUpdateOrderStatus } from "../services/order/order.queries";
import { Order, OrderStatus } from "../types/order.types";

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
   useOrderNotification()
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
        // Kitchen only shows what is currently being cooked
        return o.status === "PREPARING";
      }
      if (activeTab === "HISTORY") {
        // Once a rider is called (OUT_FOR_DELIVERY), it moves to history
        return ["DELIVERED", "CANCELLED", "REFUNDED", "OUT_FOR_DELIVERY"].includes(o.status);
      }
      return false;
    });
  }, [orders, activeTab]);

  // --- 4. HANDLERS ---
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateStatus(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          // Optional: Add a subtle toast here if you have a Toast component
          console.log(`Order ${orderId} updated to ${newStatus}`);
        },
        onError: (error: any) => {
          // 🛑 ERROR HANDLING FOR STATE MACHINE
          // If backend throws "Invalid State Transition", we show it here.
          const message = error?.response?.data?.message || error.message || "Failed to update status";
          Alert.alert("Action Failed", message);
        }
      }
    );
  };

  const formatItems = (items: Order['items']) => {
    return items.map(i => `${i.quantity}x ${i.menuItemName}`).join(", ");
  };

  // --- 5. RENDER COMPONENTS ---

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface }]}>
      {/* Top Row */}
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
            {new Date().toDateString()}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {user?.restaurant?.name || "My Kitchen"}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: colors.success + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.statusText, { color: colors.success }]}>Online</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {orders.filter(o => o.status === 'PENDING').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>New</Text>
        </View>
        <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {orders.filter(o => o.status === 'PREPARING').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Cooking</Text>
        </View>
      </View>
    </View>
  );

const renderOrder = ({ item }: { item: Order }) => {
    // Status Badge Color Logic
    let badgeColor = colors.textLight;
    let badgeBg = isDark ? '#374151' : '#F3F4F6';
    
    if (item.status === 'PENDING') { badgeColor = colors.primary; badgeBg = colors.primary + '15'; }
    if (item.status === 'PREPARING') { badgeColor = '#F59E0B'; badgeBg = '#F59E0B15'; } // Amber
    if (item.status === 'OUT_FOR_DELIVERY') { badgeColor = colors.success; badgeBg = colors.success + '15'; }
    if (item.status === 'CANCELLED') { badgeColor = colors.danger; badgeBg = colors.danger + '15'; }

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? "#000" : "#ccc" }]}>
        
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.idContainer}>
            <Text style={[styles.orderId, { color: colors.text }]}>
              #{item.reference ? item.reference.slice(0, 4).toUpperCase() : item.id.slice(0, 4)}
            </Text>
            <Text style={[styles.customerName, { color: colors.textLight }]}>
              • {item.customer?.name || "Guest"}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.statusTextBadge, { color: badgeColor }]}>
              {item.status.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* 1. Order Items (Now on top) */}
        <Text style={[styles.items, { color: colors.text, marginBottom: item.deliveryNotes ? 12 : 4 }]}>
          {formatItems(item.items)}
        </Text>

        {/* 2. ✅ Special Instructions (Now below items) */}
        {item.deliveryNotes && (
          <View style={{ 
            marginTop: 4,
            marginBottom: 12,
            padding: 12, 
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', // Amber tint
            borderWidth: 1,
            borderColor: isDark ? '#B45309' : '#FCD34D', // Amber border
            borderRadius: 8,
            borderStyle: 'dashed', // Dashed line makes it look like a "Note"
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="clipboard-outline" size={16} color={isDark ? '#FCD34D' : '#D97706'} style={{ marginRight: 6 }} />
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '800', 
                color: isDark ? '#FCD34D' : '#D97706', 
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                Special Instruction
              </Text>
            </View>
            <Text style={{ 
              fontSize: 14, 
              color: isDark ? '#E5E7EB' : '#4B5563', 
              lineHeight: 20,
              fontStyle: 'italic'
            }}>
              &quot;{item.deliveryNotes}&quot;
            </Text>
          </View>
        )}
        
        {/* Price Row */}
        <View style={styles.priceRow}>
           <Text style={[styles.priceLabel, { color: colors.textLight }]}>Total:</Text>
           <Text style={[styles.price, { color: colors.primary }]}>
             ₦{item.totalAmount.toLocaleString()}
           </Text>
        </View>

        {/* Action Buttons */}
        {activeTab !== 'HISTORY' && (
          <View style={styles.actionRow}>
            {item.status === "PENDING" ? (
              // NEW ORDERS
              <>
                <TouchableOpacity 
                  disabled={isUpdating}
                  style={[styles.btn, styles.btnOutline, { borderColor: colors.danger }]}
                  onPress={() => handleStatusUpdate(item.id, "CANCELLED")}
                >
                  <Text style={[styles.btnText, { color: colors.danger }]}>Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  disabled={isUpdating}
                  style={[styles.btn, { backgroundColor: colors.success }]}
                  onPress={() => handleStatusUpdate(item.id, "PREPARING")}
                >
                  <Text style={[styles.btnText, { color: 'white' }]}>Accept Order</Text>
                </TouchableOpacity>
              </>
            ) : (
              // PREPARING ORDERS
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: colors.primary }]}
                disabled={isUpdating} 
                onPress={() => handleStatusUpdate(item.id, "OUT_FOR_DELIVERY")}
              >
                <Ionicons name="bicycle" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={[styles.btnText, { color: "white" }]}>
                  Call Rider
                </Text>
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
      
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface, zIndex: 10 }}>
        {renderHeader()}
      </SafeAreaView>

      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        {['PENDING', 'PREPARING', 'HISTORY'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab as any)}
            style={[
              styles.tabItem, 
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
            ]}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === tab ? colors.primary : colors.textLight }
            ]}>
              {tab === 'PENDING' ? 'New Orders' : tab === 'PREPARING' ? 'Kitchen' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !orders.length ? (
        <View style={styles.center}>
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
              <View style={[styles.emptyIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="receipt-outline" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                {activeTab === 'HISTORY' ? "No past orders yet" : "All caught up!"}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerSubtitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontSize: 20, fontWeight: '800', marginRight: 6 },
  statLabel: { fontSize: 14, fontWeight: '500' },
  verticalLine: { width: 1, height: 20, marginHorizontal: 20 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '700' },
  listContent: { padding: 20 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  idContainer: { flexDirection: 'row', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: '800' },
  customerName: { fontSize: 14, marginLeft: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusTextBadge: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  divider: { height: 1, width: '100%', marginBottom: 12 },
  items: { fontSize: 15, fontWeight: '500', lineHeight: 22, marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'baseline', marginBottom: 16 },
  priceLabel: { fontSize: 13, marginRight: 6 },
  price: { fontSize: 18, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  btnOutline: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '500' },
});