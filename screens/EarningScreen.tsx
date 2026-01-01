import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, ActivityIndicator, Alert, Modal, 
  TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useGetEarnings, useGetTransactions, useRequestPayout } from '../services/restaurant/restaurant.queries';
import { useTheme } from '../context/themeContext';
import HeaderTemp from '../components/HeaderTemp';
import { SPACING, SHADOWS } from '../constants/theme';

// Helper: Shorten Description
const formatDescription = (text: string) => {
  if (!text) return "Transaction";
  return text.replace(/(Order #)([a-zA-Z0-9]{4})[a-zA-Z0-9-]+/, "$1$2");
};

// Helper: Format Date
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
};

export default function EarningsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const restaurantId = user?.restaurant?.id;

  // 1. Queries
  const { data: earningsData, isLoading: isLoadingEarnings, refetch: refetchEarnings } = useGetEarnings(restaurantId || "");
  const { data: transactionData, isLoading: isLoadingTx, refetch: refetchTx } = useGetTransactions(restaurantId || "");
  const { mutate: requestPayout, isPending: isPayoutLoading } = useRequestPayout();

  // 2. Data
  const earnings = earningsData?.data;
  const available = earnings?.availableBalance || 0;
  const pending = earnings?.pendingBalance || 0;
  const transactions = transactionData?.data || [];

  // 3. Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Pre-fill amount when modal opens
  useEffect(() => {
    if (isModalVisible) {
      setWithdrawAmount(available.toString());
    }
  }, [isModalVisible, available]);

  const onRefresh = () => {
    refetchEarnings();
    refetchTx();
  };

  // 4. Handlers
  const handleOpenModal = () => {
    if (available < 1000) {
      Alert.alert("Low Balance", "Minimum withdrawal is ₦1,000");
      return;
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmitPayout = () => {
    // Basic Validation
    if (!bankName || !accountNumber || !accountName || !withdrawAmount) {
      Alert.alert("Missing Details", "Please fill in all bank details.");
      return;
    }
    
    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 1000) {
      Alert.alert("Invalid Amount", "Minimum withdrawal is ₦1,000");
      return;
    }

    if (amountNum > available) {
      Alert.alert("Insufficient Funds", "You cannot withdraw more than your available balance.");
      return;
    }

    // Call API with Typed Payload
    requestPayout(
      { 
        restaurantId: restaurantId || "", 
        amount: amountNum,
        bankDetails: { 
          bankName,
          accountNumber,
          accountName
        }
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          // Clear sensitive fields
          setAccountNumber('');
          setAccountName('');
        }
      }
    );
  };

  const isLoading = isLoadingEarnings || isLoadingTx;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderTemp title="Earnings" subtitle="Financial Overview" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* --- AVAILABLE BALANCE CARD --- */}
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={[styles.cardLabel, { color: 'rgba(255,255,255,0.8)' }]}>Withdrawable Balance</Text>
            <Text style={[styles.amount, { color: colors.white }]}>₦{available.toLocaleString()}</Text>
            
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={handleOpenModal}
              disabled={available < 1000}
            >
              <Text style={[styles.withdrawText, { color: colors.primary }]}>
                {available < 1000 ? "Low Balance" : "Request Payout"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="wallet" size={24} color={colors.white} />
          </View>
        </View>

        {/* --- PENDING CARD --- */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.secondary, borderWidth: 1 }]}>
          <View>
            <Text style={[styles.cardLabel, { color: colors.textLight }]}>Pending Clearance</Text>
            <Text style={[styles.amount, { color: colors.text }]}>₦{pending.toLocaleString()}</Text>
            <Text style={[styles.note, { color: colors.secondary }]}>*Funds move to withdrawable after delivery</Text>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255, 193, 7, 0.15)' : '#FFF8E1' }]}>
            <Ionicons name="time" size={24} color={colors.secondary} />
          </View>
        </View>

        {/* --- TRANSACTIONS LIST --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
          {transactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: colors.textLight }}>No transactions yet.</Text>
            </View>
          ) : (
            /* ✅ FIX: Added borderWidth and borderColor 
               This ensures the list is visible in Dark Mode where shadows are invisible.
            */
            <View style={[
              styles.listContainer, 
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                borderWidth: 1, 
                ...SHADOWS.medium 
              }
            ]}>
              {transactions.map((item: any) => (
                <View key={item.id} style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.transactionLeft}>
                    <Text style={[styles.transactionTitle, { color: colors.text }]} numberOfLines={1}>
                      {formatDescription(item.description)}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textLight }]}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: item.type === 'CREDIT' ? '#10B981' : '#EF4444' }]}>
                      {item.type === 'CREDIT' ? '+' : '-'} ₦{(item.amount || 0).toLocaleString()}
                    </Text>
                    <Text style={[styles.transactionStatus, { color: colors.textLight }]}>{item.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- 🏦 PAYOUT MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {/* ✅ FIX: Changed colors.card to colors.surface */}
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              
              <View style={styles.modalHandle} />

              <Text style={[styles.modalTitle, { color: colors.text }]}>Request Payout</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textLight }]}>
                Enter your bank details to receive funds.
              </Text>

              {/* INPUTS */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Bank Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. GTBank"
                  placeholderTextColor={colors.textLight}
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Account Number</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="0123456789"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 0.7 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Amount (₦)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Account Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textLight}
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              {/* ACTION BUTTONS */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.btnCancel, { borderColor: colors.border }]} 
                  onPress={handleCloseModal}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btnConfirm, { backgroundColor: colors.primary }]} 
                  onPress={handleSubmitPayout}
                  disabled={isPayoutLoading}
                >
                  {isPayoutLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm Withdrawal</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.l },
  card: { borderRadius: 16, padding: SPACING.l, marginBottom: SPACING.m, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', ...SHADOWS.medium },
  cardLabel: { fontSize: 14, marginBottom: SPACING.xs, fontWeight: '600' },
  amount: { fontSize: 32, fontWeight: '800', marginBottom: 10 },
  note: { fontSize: 11, marginTop: SPACING.s, fontStyle: 'italic', fontWeight: '500' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  withdrawButton: { backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start' },
  withdrawText: { fontWeight: '700', fontSize: 12 },
  section: { marginTop: SPACING.m, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.s },
  emptyState: { padding: SPACING.l, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  listContainer: { borderRadius: 12, overflow: 'hidden', elevation: 2 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.m, borderBottomWidth: 1 },
  transactionLeft: { flex: 1, marginRight: 10 },
  transactionRight: { alignItems: 'flex-end' },
  transactionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  transactionDate: { fontSize: 12 },
  transactionAmount: { fontSize: 14, fontWeight: '700' },
  transactionStatus: { fontSize: 10, marginTop: 2, textTransform: 'uppercase' },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.l, paddingBottom: 40, ...SHADOWS.medium },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginRight: 10 },
  btnConfirm: { flex: 2, padding: 14, borderRadius: 12, alignItems: 'center' },
});