// screens/MenuScreen.tsx
import React from 'react';
import { 
  View, Text, FlatList,  TouchableOpacity, StyleSheet, SafeAreaView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

const MENU_ITEMS = [
  { id: '1', name: 'Jollof Rice', category: 'Rice', price: 2500, available: true },
  { id: '2', name: 'Fried Rice', category: 'Rice', price: 2500, available: true },
  { id: '3', name: 'Grilled Turkey', category: 'Proteins', price: 3000, available: false },
];

export default function MenuScreen({ navigation }: any) {
  const renderItem = ({ item }: any) => (
    <View style={styles.itemCard}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="fast-food" size={24} color={COLORS.textLight} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: item.available ? '#ECFDF5' : '#F3F4F6' }]}>
          <Text style={[styles.statusText, { color: item.available ? COLORS.success : COLORS.textLight }]}>
            {item.available ? 'Active' : 'Sold Out'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Menu</Text>
      </View>

      <FlatList 
        data={MENU_ITEMS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: SPACING.m }}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddMenuItem')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { padding: SPACING.l, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  
  itemCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: SPACING.m, borderRadius: 12, marginBottom: SPACING.s, alignItems: 'center', ...SHADOWS.small },
  imagePlaceholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  itemCategory: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginTop: 4 },
  
  statusContainer: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  editBtn: { padding: 4 },
  
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium }
});