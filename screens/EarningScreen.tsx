import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS, SPACING } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/HeaderTemp"; // Import Header

export default function EarningsScreen() {
  return (
    <View style={styles.container}>
      {/* New Header */}
      <Header title="Financials" subtitle="Earnings" showNotification={false} />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>₦ 145,000.00</Text>
          </View>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawText}>Withdraw</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>

        {/* Mock List */}
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.transactionItem}>
            <View style={styles.iconBox}>
              <Ionicons name="checkmark" size={18} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.transTitle}>Order Payout #{100 + i}</Text>
              <Text style={styles.transDate}>Today, 2:30 PM</Text>
            </View>
            <Text style={styles.transAmount}>+₦5,000</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  balanceCard: {
    margin: SPACING.m,
    padding: SPACING.l,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: { color: COLORS.white, fontSize: 28, fontWeight: "bold" },
  withdrawBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  withdrawText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginRight: 4,
    fontSize: 12,
  },
  sectionTitle: {
    marginLeft: SPACING.m,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.m,
    marginBottom: SPACING.s,
    borderRadius: 12,
    elevation: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
  },
  transTitle: { fontWeight: "600", color: COLORS.text, fontSize: 14 },
  transDate: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  transAmount: { fontWeight: "bold", color: COLORS.success, fontSize: 16 },
});
