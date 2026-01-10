import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, 
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl, Dimensions 
} from 'react-native';
import { SPACING, SHADOWS, COLORS } from "../constants/theme";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/HeaderTemp';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import { useRestaurantEarnings, useRestaurantTransactions, useRequestPayout } from '../services/restaurant/restaurant.queries';
import { Transaction } from '../types/restaurant.types';

export default function EarningsScreen() {
  const { colors, isDark } = useTheme();
  const { restaurant } = useAuth();
  const restaurantId = restaurant?.id || "";

  // 1. DATA FETCHING
  const { 
    data: earnings, 
    isLoading: loadingEarnings, 
    refetch: refetchEarnings,
    isRefetching: isRefetchingEarnings 
  } = useRestaurantEarnings(restaurantId);

  const { 
    data: transactions, 
    isLoading: loadingTxns, 
    refetch: refetchTxns,
    isRefetching: isRefetchingTxns 
  } = useRestaurantTransactions(restaurantId);

  const { mutate: payout, isPending: isPayingOut } = useRequestPayout();

  // 2. STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ amount: "", bankName: "", accountNumber: "", accountName: "" });

  // 3. SAFE ACCESSORS (With Debugging)
  const availableBalance = earnings?.availableBalance ?? 0;
  const pendingBalance = earnings?.pendingBalance ?? 0;

  // 4. HANDLERS
  const onRefresh = () => {
    refetchEarnings();
    refetchTxns();
  };

  const handleWithdrawPress = () => {
    // Better UX: Let them click, then tell them why if it fails
    if (availableBalance < 1000) {
      Alert.alert("Insufficient Balance", `You need at least ₦1,000 to withdraw.\nCurrent: ₦${availableBalance.toLocaleString()}`);
      return;
    }
    setModalVisible(true);
  };

  const handleConfirmPayout = () => {
    const withdrawAmount = parseFloat(form.amount);

    if (!withdrawAmount || isNaN(withdrawAmount)) return Alert.alert("Error", "Enter a valid amount");
    if (withdrawAmount < 1000) return Alert.alert("Error", "Minimum withdrawal is ₦1,000");
    if (withdrawAmount > availableBalance) return Alert.alert("Error", "Insufficient funds");
    if (!form.accountNumber || !form.accountName || !form.bankName) return Alert.alert("Error", "All bank details are required");

    payout({
      restaurantId,
      amount: withdrawAmount,
      bankDetails: { 
        bankName: form.bankName, 
        accountNumber: form.accountNumber, 
        accountName: form.accountName 
      }
    }, {
      onSuccess: () => {
        setModalVisible(false);
        setForm({ amount: "", bankName: "", accountNumber: "", accountName: "" });
        Alert.alert("Success", "Payout request submitted.");
        onRefresh(); // Refresh immediately
      },
      onError: (err: any) => Alert.alert("Payout Failed", err.response?.data?.message || "Something went wrong")
    });
  };

  // ... (renderTransaction remains the same) ...
  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === 'CREDIT';
    const dateString = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';

    return (
      <View style={[styles.txnRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
          <MaterialCommunityIcons 
            name={isCredit ? "arrow-bottom-left" : "arrow-top-right"} 
            size={22} 
            color={isCredit ? '#166534' : '#991B1B'} 
          />
        </View>
        
        <View style={styles.txnContent}>
          <Text style={[styles.txnDesc, { color: colors.text }]} numberOfLines={1}>
            {item.description || item.type}
          </Text>
          <Text style={[styles.txnDate, { color: colors.textLight }]}>{dateString}</Text>
        </View>

        <Text style={[styles.txnAmount, { color: isCredit ? COLORS.success : COLORS.danger }]}>
          {isCredit ? '+' : '-'} ₦{item.amount.toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Wallet" subtitle="Earnings & Payouts" showNotification={false} />

      <FlatList
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetchingEarnings || isRefetchingTxns} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary} 
          />
        }
        data={transactions || []}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={
          <>
            {/* --- BALANCE CARD --- */}
            <View style={styles.cardContainer}>
              <View style={[styles.mainCard, { backgroundColor: COLORS.primary }]}>
                
                {/* Available */}
                <View style={styles.availableSection}>
                  <View>
                    <Text style={styles.labelAvailable}>Available Balance</Text>
                    {loadingEarnings ? (
                        <ActivityIndicator color="white" style={{marginTop: 5, alignSelf:'flex-start'}} />
                    ) : (
                        <Text style={styles.valueAvailable}>
                        ₦{availableBalance.toLocaleString()}
                        </Text>
                    )}
                  </View>
                  <View style={styles.iconContainer}>
                     <Ionicons name="wallet" size={32} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Pending */}
                <View style={styles.pendingRow}>
                  <View style={styles.pendingInfo}>
                    <Ionicons name="time-outline" size={16} color="#FFD700" style={{ marginRight: 6 }} />
                    <Text style={styles.labelPending}>Pending Clearance</Text>
                  </View>
                  <Text style={styles.valuePending}>
                    ₦{pendingBalance.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Withdraw Button */}
              <TouchableOpacity 
                style={[styles.withdrawBtn, { backgroundColor: isDark ? colors.surface : '#FFF' }]} 
                onPress={handleWithdrawPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.withdrawText, { color: COLORS.primary }]}>Withdraw Funds</Text>
                <Ionicons name="arrow-forward-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: SPACING.m }]}>
              Recent Transactions
            </Text>
          </>
        }
        ListEmptyComponent={
          !loadingTxns ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="receipt-text-outline" size={48} color={colors.textLight} />
              <Text style={{ color: colors.textLight, marginTop: 10 }}>No transactions yet</Text>
            </View>
          ) : (
            <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
          )
        }
      />

      {/* --- PAYOUT MODAL --- */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : 'white' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? 'white' : 'black' }]}>Request Withdrawal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : '#666'} />
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Amount (₦)</Text>
                <TextInput 
                    style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#374151' : '#F9FAFB' }]} 
                    keyboardType="numeric" 
                    placeholder={`Max: ${availableBalance}`} 
                    placeholderTextColor={colors.textLight}
                    value={form.amount} 
                    onChangeText={(t) => setForm({ ...form, amount: t })} 
                />
            </View>

            {/* Bank Details */}
            <View style={styles.rowInputs}>
                 <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Bank Name</Text>
                    <TextInput 
                        style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#374151' : '#F9FAFB' }]} 
                        placeholder="GTBank" 
                        placeholderTextColor={colors.textLight}
                        value={form.bankName} 
                        onChangeText={(t) => setForm({ ...form, bankName: t })} 
                    />
                 </View>
                 <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Account No.</Text>
                    <TextInput 
                        style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#374151' : '#F9FAFB' }]} 
                        keyboardType="numeric" 
                        placeholder="012..." 
                        placeholderTextColor={colors.textLight}
                        value={form.accountNumber} 
                        onChangeText={(t) => setForm({ ...form, accountNumber: t })} 
                        maxLength={10}
                    />
                 </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Account Name</Text>
                <TextInput 
                    style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#374151' : '#F9FAFB' }]} 
                    placeholder="Matches Bank Record" 
                    placeholderTextColor={colors.textLight}
                    value={form.accountName} 
                    onChangeText={(t) => setForm({ ...form, accountName: t })} 
                />
            </View>

            <TouchableOpacity 
              style={[styles.confirmBtn, { backgroundColor: COLORS.primary, opacity: isPayingOut ? 0.7 : 1 }]} 
              onPress={handleConfirmPayout} 
              disabled={isPayingOut}
            >
              {isPayingOut ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Withdrawal</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Card
  cardContainer: { margin: SPACING.m, marginBottom: SPACING.l },
  mainCard: { 
    borderRadius: 24, 
    padding: SPACING.l, 
    ...SHADOWS.medium,
    marginBottom: SPACING.m,
  },
  availableSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  labelAvailable: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  valueAvailable: { color: '#FFF', fontSize: 34, fontWeight: '800', marginTop: 4 },
  iconContainer: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  
  pendingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pendingInfo: { flexDirection: 'row', alignItems: 'center' },
  labelPending: { color: '#FFD700', fontSize: 14, fontWeight: '600' },
  valuePending: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // Withdraw Button
  withdrawBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 16, 
    ...SHADOWS.small 
  },
  withdrawText: { fontSize: 16, fontWeight: 'bold' },

  // List
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  txnRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txnContent: { flex: 1 },
  txnDesc: { fontWeight: '600', fontSize: 15, marginBottom: 2 },
  txnDate: { fontSize: 12 },
  txnAmount: { fontWeight: '700', fontSize: 15 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  
  inputGroup: { marginBottom: 16 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, opacity: 0.8 },
  input: { borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
  
  confirmBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, ...SHADOWS.medium },
  confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});