import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, SHADOWS } from "../constants/theme";
import Header from "../components/HeaderTemp";
import { useTheme } from "../context/themeContext";

// --- MOCK DATA ---
const ACTIVE_ORDERS = [
  { id: "1023", items: "2x Jollof Rice, 1x Chicken", price: 5000, status: "PENDING", time: "2 mins ago", customer: "John Doe" },
  { id: "1022", items: "1x Fried Rice, 1x Coke", price: 2500, status: "PREPARING", time: "15 mins ago", customer: "Sarah S." },
];

const HISTORY_ORDERS = [
  { id: "1020", items: "3x Beef Burger", price: 9000, status: "DELIVERED", time: "Yesterday", customer: "Mike T." },
  { id: "1019", items: "1x Shawarma", price: 1500, status: "CANCELLED", time: "Yesterday", customer: "Paul A." },
  { id: "1018", items: "5x Pasta", price: 12500, status: "DELIVERED", time: "2 days ago", customer: "Anna B." },
];

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  // Added 'HISTORY' to the state type
  const [activeTab, setActiveTab] = useState<"PENDING" | "PREPARING" | "HISTORY">("PENDING");

  // Logic to switch between Active and History datasets
  const getDisplayData = () => {
    if (activeTab === "HISTORY") return HISTORY_ORDERS;
    return ACTIVE_ORDERS.filter((o) => o.status === activeTab);
  };

  const filteredOrders = getDisplayData();

  const renderOrder = ({ item }: any) => {
    // Helper to style the status badge for History items
    const getStatusColor = (status: string) => {
      if (status === 'DELIVERED') return colors.success;
      if (status === 'CANCELLED') return colors.danger;
      return colors.textLight;
    };

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
            <Text style={[styles.customerName, { color: colors.textLight }]}>{item.customer}</Text>
          </View>
          
          {/* DIFFERENT BADGE FOR HISTORY */}
          {activeTab === 'HISTORY' ? (
            <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F3F4F6' }]}>
              <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold', fontSize: 12 }}>
                {item.status}
              </Text>
            </View>
          ) : (
            <View style={[styles.timeBadge, { backgroundColor: isDark ? '#374151' : '#FFF5F5' }]}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.timeText, { color: colors.primary }]}>{item.time}</Text>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.items, { color: colors.text }]}>{item.items}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>₦{item.price.toLocaleString()}</Text>

        {/* ACTION BUTTONS (Only for Active Orders) */}
        {activeTab !== 'HISTORY' && (
          <View style={styles.actionRow}>
            {item.status === "PENDING" ? (
              <>
                <TouchableOpacity style={[styles.btn, styles.btnReject, { borderColor: isDark ? '#EF4444' : '#FECACA', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                  <Text style={[styles.btnRejectText, { color: colors.danger }]}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]}>
                  <Text style={styles.btnAcceptText}>Accept Order</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]}>
                <Ionicons name="bicycle" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.btnReadyText}>Call Rider (Ready)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Mama's Kitchen" subtitle="Good Afternoon," showNotification={true} />

      {/* --- 3 TABS LAYOUT --- */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Tab 1: New */}
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab("PENDING")}>
          <Text style={[styles.tabText, activeTab === "PENDING" ? { color: colors.primary, fontWeight: 'bold' } : { color: colors.textLight }]}>New</Text>
          {activeTab === "PENDING" && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
        
        {/* Tab 2: Kitchen */}
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab("PREPARING")}>
          <Text style={[styles.tabText, activeTab === "PREPARING" ? { color: colors.primary, fontWeight: 'bold' } : { color: colors.textLight }]}>Kitchen</Text>
          {activeTab === "PREPARING" && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>

        {/* Tab 3: History */}
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab("HISTORY")}>
          <Text style={[styles.tabText, activeTab === "HISTORY" ? { color: colors.primary, fontWeight: 'bold' } : { color: colors.textLight }]}>History</Text>
          {activeTab === "HISTORY" && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={60} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              {activeTab === 'HISTORY' ? "No past orders yet." : "No active orders."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 16, alignItems: "center" },
  tabText: { fontWeight: "600", fontSize: 14 },
  activeIndicator: { position: "absolute", bottom: 0, height: 3, width: "60%", borderRadius: 3 },
  listContent: { padding: SPACING.m },
  card: { borderRadius: 16, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOWS.small },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderId: { fontSize: 16, fontWeight: "800" },
  customerName: { fontSize: 14, marginTop: 2 },
  timeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timeText: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  divider: { height: 1, marginVertical: SPACING.m },
  items: { fontSize: 16, fontWeight: "500", marginBottom: SPACING.s },
  price: { fontSize: 18, fontWeight: "bold", marginBottom: SPACING.m },
  actionRow: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  btnReject: { borderWidth: 1 },
  btnRejectText: { fontWeight: "700" },
  btnAcceptText: { color: "white", fontWeight: "700" },
  btnReadyText: { color: "white", fontWeight: "700" },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16 },
});