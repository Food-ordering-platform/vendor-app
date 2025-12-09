import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, SHADOWS } from '../constants/theme';
import Header from '../components/HeaderTemp';
import { useTheme } from '../context/themeContext';

const MENU_ITEMS = [
  { id: '1', name: 'Jollof Rice', category: 'Rice', price: 2500, available: true },
  { id: '2', name: 'Fried Rice', category: 'Rice', price: 2500, available: true },
  { id: '3', name: 'Grilled Turkey', category: 'Proteins', price: 3000, available: false },
];

export default function MenuScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();

  const renderItem = ({ item }: any) => (
    <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
        <Ionicons name="fast-food" size={24} color={colors.textLight} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemCategory, { color: colors.textLight }]}>{item.category}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>₦{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: item.available ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5') : (isDark ? '#374151' : '#F3F4F6') }]}>
          <Text style={[styles.statusText, { color: item.available ? colors.success : colors.textLight }]}>
            {item.available ? 'Active' : 'Sold Out'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Menu Management" showNotification={false} />

      <FlatList 
        data={MENU_ITEMS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: SPACING.m }}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddMenuItem')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  itemCard: { flexDirection: 'row', padding: SPACING.m, borderRadius: 12, marginBottom: SPACING.s, alignItems: 'center', ...SHADOWS.small },
  imagePlaceholder: { width: 60, height: 60, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemCategory: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  statusContainer: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  editBtn: { padding: 4 },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: "#000", shadowOpacity: 0.3, shadowOffset: {width: 0, height: 2} }
});