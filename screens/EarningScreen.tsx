import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, 
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl 
} from 'react-native';
import { SPACING, SHADOWS, COLORS } from "../constants/theme";
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/HeaderTemp';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
import { useRestaurantEarnings, useRestaurantTransactions, useRequestPayout } from '../services/restaurant/restaurant.queries';
import { Transaction } from '../types/restaurant.types';

export default function EarningsScreen() {
  const { colors, isDark } = useTheme();
  // [FIX] Access restaurant safely from updated context
  const { restaurant } = useAuth();
  const restaurantId = restaurant?.id || "";

  // Queries
  const { data: earnings, isLoading: loadingEarnings, refetch: refetchEarnings } = useRestaurantEarnings(restaurantId);
  const { data: transactions, isLoading: loadingTxns, refetch: refetchTxns } = useRestaurantTransactions(restaurantId);
  const { mutate: payout, isPending: isPayingOut } = useRequestPayout();

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");

  const onRefresh = () => {
    refetchEarnings();
    refetchTxns();
  };

  const handleWithdraw = () => {
    const balance = earnings?.availableBalance || 0;
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount < 1000) return Alert.alert("Error", "Minimum withdrawal is ₦1,000");
    if (withdrawAmount > balance) return Alert.alert("Error", "Insufficient funds");
    if (!accountNumber || !accountName || !bankName) return Alert.alert("Error", "Please fill all bank details");

    payout({
      restaurantId,
      amount: withdrawAmount,
      bankDetails: { bankName, accountNumber, accountName }
    }, {
      onSuccess: () => {
        setModalVisible(false);
        setAmount(""); setAccountNumber(""); setAccountName(""); setBankName("");
        Alert.alert("Success", "Payout request submitted successfully.");
      },
      onError: (err: any) => Alert.alert("Error", err.response?.data?.message || "Payout failed")
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === 'CREDIT';
    
    // [FIX] Date handling: Ensure createdAt is valid before parsing
    const dateString = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';

    return (
      <View style={[styles.txnRow, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconBox, { backgroundColor: isCredit ? (isDark ? '#064E3B' : '#DCFCE7') : (isDark ? '#7F1D1D' : '#FEE2E2') }]}>
          <Ionicons name={isCredit ? "arrow-down" : "arrow-up"} size={18} color={isCredit ? COLORS.success : COLORS.danger} />
        </View>
        <View style={{ flex: 1 }}>
          {/* [FIX] Use explicit description field from backend */}
          <Text style={[styles.txnDesc, { color: colors.text }]}>
            {item.description || "Transaction"}
          </Text>
          <Text style={[styles.txnDate, { color: colors.textLight }]}>
            {dateString}
          </Text>
        </View>
        <Text style={[styles.txnAmount, { color: isCredit ? COLORS.success : COLORS.danger }]}>
          {isCredit ? '+' : '-'}₦{item.amount.toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Wallet" subtitle="Manage Earnings" showNotification={false} />

      {/* 1. BALANCE CARD */}
      <View style={[styles.balanceCard, { backgroundColor: COLORS.primary }]}>
        <View>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>₦{(earnings?.availableBalance || 0).toLocaleString()}</Text>
          <Text style={styles.pendingLabel}>Pending: ₦{(earnings?.pendingBalance || 0).toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.withdrawBtn} 
          onPress={() => setModalVisible(true)}
          disabled={loadingEarnings || (earnings?.availableBalance || 0) <= 0}
        >
          <Text style={[styles.withdrawText, { color: COLORS.primary }]}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* 2. TRANSACTIONS */}
      <View style={styles.historyContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
        <FlatList
          data={transactions || []}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          refreshControl={<RefreshControl refreshing={loadingTxns} onRefresh={onRefresh} tintColor={COLORS.primary}/>}
          ListEmptyComponent={
            <Text style={{ textAlign:'center', marginTop:20, color:colors.textLight }}>
              No transactions yet.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      {/* 3. WITHDRAWAL MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1F2937' : 'white' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? 'white' : 'black' }]}>Request Payout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : 'black'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>Amount (₦)</Text>
            <TextInput 
                style={[styles.input, { color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} 
                keyboardType="numeric" 
                placeholder="0.00" 
                placeholderTextColor={colors.textLight}
                value={amount} 
                onChangeText={setAmount} 
            />

            <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>Bank Name</Text>
            <TextInput 
                style={[styles.input, { color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} 
                placeholder="e.g. Access Bank" 
                placeholderTextColor={colors.textLight}
                value={bankName} 
                onChangeText={setBankName} 
            />

            <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>Account Number</Text>
            <TextInput 
                style={[styles.input, { color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} 
                keyboardType="numeric" 
                placeholder="0123456789" 
                placeholderTextColor={colors.textLight}
                value={accountNumber} 
                onChangeText={setAccountNumber} 
                maxLength={10} 
            />

            <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>Account Name</Text>
            <TextInput 
                style={[styles.input, { color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} 
                placeholder="Account Holder Name" 
                placeholderTextColor={colors.textLight}
                value={accountName} 
                onChangeText={setAccountName} 
            />

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: COLORS.primary }]} onPress={handleWithdraw} disabled={isPayingOut}>
              {isPayingOut ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Confirm Payout</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceCard: { margin: SPACING.m, padding: SPACING.l, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.medium },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  balanceValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  pendingLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  withdrawBtn: { backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25 },
  withdrawText: { fontWeight: 'bold', fontSize: 12 },
  
  historyContainer: { flex: 1, paddingHorizontal: SPACING.m },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, marginTop: 10 },
  txnRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, borderRadius: 12, marginBottom: 10, ...SHADOWS.small },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
  txnDesc: { fontWeight: '600', fontSize: 14, marginBottom: 2 },
  txnDate: { fontSize: 12 },
  txnAmount: { fontWeight: 'bold', fontSize: 16 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  confirmBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});