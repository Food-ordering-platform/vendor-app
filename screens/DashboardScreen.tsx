import React, { useState, useMemo, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, StatusBar, ActivityIndicator, 
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"; 
import { useAuth } from "../context/authContext";
import { useGetVendorOrders, useUpdateOrderStatus } from "../services/order/order.queries";
import { Order, OrderStatus } from "../types/order.types";
import { format } from "date-fns"; 
import { getTimeAgo } from "@/hooks/usegetTime";

const COLORS = {
  primary: "#7B1E3A",       
  primaryLight: "#7B1E3A15", 
  secondary: "#1F2937",     
  background: "#F9FAFB",    
  card: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  text: "#111827",
  textLight: "#6B7280",
  border: "#E5E7EB",
  subtle: "#F3F4F6"
};

type TabType = "PENDING" | "PREPARING" | "HISTORY";
const PLATFORM_FEE = 350;

export default function DashboardScreen() {
  const { user } = useAuth();
  const restaurantId = user?.restaurant?.id || "";
  const insets = useSafeAreaInsets(); 

  const { data: ordersResponse, isLoading, refetch, isRefetching } = useGetVendorOrders(restaurantId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [, forceUpdate] = useState(0);

  const orders: Order[] = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.data || []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab === "PENDING") return o.status === "PENDING";
      if (activeTab === "PREPARING") return o.status === "PREPARING" || o.status === "READY_FOR_PICKUP";
      if (activeTab === "HISTORY") return ["DELIVERED", "CANCELLED", "REFUNDED", "OUT_FOR_DELIVERY"].includes(o.status);
      return false;
    });
  }, [orders, activeTab]);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(v => v + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateStatus({ orderId, status: newStatus });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.dateText}>{format(new Date(), "EEEE, d MMMM")}</Text>
        <Text style={styles.restaurantName}>{user?.restaurant?.name || "My Restaurant"}</Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['PENDING', 'PREPARING', 'HISTORY'] as TabType[]).map((tab) => {
        const isActive = activeTab === tab;
        const count = orders.filter(o => {
            if (tab === 'PENDING') return o.status === 'PENDING';
            if (tab === 'PREPARING') return o.status === 'PREPARING' || o.status === 'READY_FOR_PICKUP';
            return false;
        }).length;

        return (
          <TouchableOpacity 
            key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab === 'PREPARING' ? 'KITCHEN' : tab}
            </Text>
            {count > 0 && tab !== 'HISTORY' && (
                <View style={[styles.badge, isActive ? {backgroundColor: 'rgba(255,255,255,0.2)'} : {backgroundColor: COLORS.textLight}]}>
                    <Text style={[styles.badgeText, {color: 'white'}]}>{count}</Text>
                </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    let statusColor = COLORS.textLight;
    let statusBg = COLORS.background;
    let statusIcon: any = "time-outline";

    if (item.status === 'PENDING') { statusColor = COLORS.warning; statusBg = '#FFFBEB'; statusIcon = 'alert-circle-outline'; }
    if (item.status === 'PREPARING') { statusColor = COLORS.primary; statusBg = COLORS.primaryLight; statusIcon = 'flame-outline'; }
    if (item.status === 'READY_FOR_PICKUP') { statusColor = '#8B5CF6'; statusBg = '#F3E8FF'; statusIcon = 'bicycle-outline'; }
    if (item.status === 'DELIVERED') { statusColor = COLORS.success; statusBg = '#ECFDF5'; statusIcon = 'checkmark-circle-outline'; }

    const foodSubtotal = item.totalAmount - item.deliveryFee - PLATFORM_FEE;
    const vendorShare = item.vendorFoodTotal;
    const chowEazyShare = foodSubtotal * 0.15;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.orderIdRow}>
                <Text style={styles.orderId}>
                    #{item.reference ? item.reference.slice(0, 6).toUpperCase() : "ORDER"}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Ionicons name={statusIcon} size={14} color={statusColor} style={{marginRight: 4}} />
                    <Text style={[styles.statusTextBadge, { color: statusColor }]}>{item.status.replace(/_/g, " ")}</Text>
                </View>
            </View>
            <Text style={styles.timeAgo}>{getTimeAgo(new Date(item.createdAt))}</Text> 
        </View>

        <View style={styles.customerRow}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.customer?.name?.[0] || "G"}</Text>
            </View>
            <View>
                <Text style={styles.customerName}>{item.customer?.name || "Guest Customer"}</Text>
                <Text style={styles.customerAddress} numberOfLines={1}>
                    {item.deliveryAddress || "Pickup Order"}
                </Text>
            </View>
        </View>

        {activeTab === 'PENDING' && (
          <View style={styles.breakdownContainer}>
              <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Food Value (Subtotal)</Text>
                  <Text style={styles.breakdownValue}>₦{foodSubtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>ChowEazy Commission (15%)</Text>
                  <Text style={[styles.breakdownValue, {color: COLORS.danger}]}>- ₦{chowEazyShare.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, {fontWeight: '700', color: COLORS.primary}]}>Your Estimated Earning</Text>
                  <Text style={[styles.breakdownValue, {fontWeight: '800', color: COLORS.primary, fontSize: 16}]}>
                      ₦{vendorShare.toLocaleString()}
                  </Text>
              </View>
          </View>
        )}

        <View style={styles.itemsContainer}>
            <Text style={styles.itemsHeader}>{item.items.length} Items</Text>
            {item.items.map((i, index) => (
                <Text key={index} style={styles.itemName}>
                    {i.quantity}x {i.menuItemName}
                </Text>
            ))}
            {activeTab !== 'PENDING' && (
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Your Earning</Text>
                    <Text style={styles.totalAmount}>₦{vendorShare.toLocaleString()}</Text>
                </View>
            )}
        </View>

        <View style={styles.actionFooter}>
             {item.status === "PENDING" && (
                <>
                    <TouchableOpacity 
                        style={styles.btnOutline} 
                        onPress={() => handleStatusUpdate(item.id, "CANCELLED")}
                        disabled={isUpdating}
                    >
                        <Text style={styles.btnOutlineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.btnPrimary} 
                        onPress={() => handleStatusUpdate(item.id, "PREPARING")}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>Accept Order</Text>}
                    </TouchableOpacity>
                </>
             )}

             {item.status === "PREPARING" && (
                <TouchableOpacity 
                    style={[styles.btnPrimary, { width: '100%', backgroundColor: COLORS.primary }]}
                    onPress={() => handleStatusUpdate(item.id, "READY_FOR_PICKUP")}
                    disabled={isUpdating}
                >
                    {isUpdating ? <ActivityIndicator color="white" /> : (
                        <>
                            <Ionicons name="bicycle" size={20} color="white" style={{marginRight: 8}} />
                            <Text style={styles.btnPrimaryText}>Food Ready - Request Rider</Text>
                        </>
                    )}
                </TouchableOpacity>
             )}

             {item.status === "READY_FOR_PICKUP" && (
                 <>
                    {item.riderName ? (
                        <View style={[styles.waitingState, { backgroundColor: '#ECFDF5' }]}>
                             <View style={[styles.pulse, { backgroundColor: COLORS.success }]} />
                             <View style={{flex: 1, marginLeft: 10}}>
                                <Text style={[styles.waitingText, { color: COLORS.success }]}>
                                    Rider Found: {item.riderName}
                                </Text>
                                <Text style={{fontSize: 10, color: COLORS.textLight}}>
                                    Waiting for arrival...
                                </Text>
                             </View>
                             <TouchableOpacity onPress={() => {/* Call Logic */}}>
                                <Ionicons name="call" size={20} color={COLORS.success} />
                             </TouchableOpacity>
                          </View>
                    ) : (
                        <View style={styles.waitingState}>
                            <View style={styles.pulse} />
                            <Text style={styles.waitingText}>Broadcasting to Riders...</Text>
                        </View>
                    )}
                 </>
             )}
             
             {["DELIVERED", "OUT_FOR_DELIVERY", "CANCELLED", "REFUNDED"].includes(item.status) && (
                 <TouchableOpacity style={[styles.btnOutline, { width: '100%', borderColor: '#E5E7EB' }]}>
                    <Text style={[styles.btnOutlineText, {color: COLORS.textLight}]}>View Details</Text>
                 </TouchableOpacity>
             )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="pot-steam-outline" size={40} color={COLORS.textLight} />
        </View>
        <Text style={styles.emptyTitle}>No Orders Here</Text>
        <Text style={styles.emptySub}>
            {activeTab === 'PENDING' ? "New orders will pop up here." : "No orders found."}
        </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.headerWrapper}>
        {renderHeader()}
        {renderTabs()}
      </View>
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        // 🟢 PWA FIX: Add bottom safe area so list isn't hidden by home bar
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false} // 🟢 Disable clipped subviews on Web to prevent blank spaces
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerWrapper: { backgroundColor: COLORS.background, zIndex: 10 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  dateText: { fontSize: 12, color: COLORS.textLight, fontWeight: '600', textTransform: 'uppercase' },
  restaurantName: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  statusContainer: { alignItems: 'flex-end' },
  statusText: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  
  tabContainer: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 15, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 4, 
    // 🟢 PWA FIX: Shadow Box works on Web & iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, 
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  activeTabText: { color: 'white' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  
  listContent: { paddingHorizontal: 20 }, 
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderId: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusTextBadge: { fontSize: 10, fontWeight: '700' },
  timeAgo: { fontSize: 12, color: COLORS.textLight },
  
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: COLORS.textLight },
  customerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  customerAddress: { fontSize: 12, color: COLORS.textLight, maxWidth: 200 },
  
  breakdownContainer: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownLabel: { fontSize: 12, color: COLORS.textLight },
  breakdownValue: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  
  itemsContainer: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 16 },
  itemsHeader: { fontSize: 11, fontWeight: '700', color: COLORS.textLight, marginBottom: 6, textTransform: 'uppercase' },
  itemName: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  moreItems: { fontSize: 12, color: COLORS.textLight, fontStyle: 'italic', marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 },
  totalLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
  totalAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  actionFooter: { flexDirection: 'row', gap: 10 },
  btnOutline: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText: { fontSize: 14, fontWeight: '700', color: COLORS.danger },
  btnPrimary: { flex: 1, height: 44, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  btnPrimaryText: { fontSize: 14, fontWeight: '700', color: 'white' },
  
  waitingState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 12, backgroundColor: '#F3E8FF', borderRadius: 10 },
  waitingText: { color: '#8B5CF6', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6', opacity: 0.8 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: 14, color: COLORS.textLight }
});