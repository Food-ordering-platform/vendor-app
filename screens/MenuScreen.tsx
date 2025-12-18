import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, SHADOWS, COLORS } from '../constants/theme';
import Header from '../components/HeaderTemp';
import { useTheme } from '../context/themeContext';
import { useGetMenuItems } from '../services/restaurant/restaurant.queries';
import { useAuth } from '../context/authContext'; // Assuming you have this

export default function MenuScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth(); // Get logged in user
  
  // TODO: Ensure your user object has the restaurantId. 
  // If not, you might need to fetch the restaurant by ownerId first.
  // For now, we assume user.restaurantId exists or you retrieve it from storage.
  const restaurantId = user?.restaurant?.id || "REPLACE_WITH_REAL_RESTAURANT_ID";

  // ✅ Use the Query Hook
  const { data: menuResponse, isLoading, refetch, isRefetching } = useGetMenuItems(restaurantId);
  
  const menuItems = menuResponse?.data || [];

  const renderItem = ({ item }: any) => (
    <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
        {item.imageUrl ? (
           <Image source={{ uri: item.imageUrl }} style={{ width: 60, height: 60, borderRadius: 8 }} />
        ) : (
           <Ionicons name="fast-food" size={24} color={colors.textLight} />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemCategory, { color: colors.textLight }]}>
           {item.category?.name || 'No Category'}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>₦{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: item.available ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5') : (isDark ? '#374151' : '#F3F4F6') }]}>
          <Text style={[styles.statusText, { color: item.available ? colors.success : colors.textLight }]}>
            {item.available ? 'Active' : 'Sold Out'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Menu Management" showNotification={false} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList 
          data={menuItems}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: SPACING.m }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: colors.textLight, marginTop: 20 }}>
                No menu items yet. Add your first dish!
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        // Pass restaurantId to the Add Screen
        onPress={() => navigation.navigate('AddMenuItem', { restaurantId })}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCard: { flexDirection: 'row', padding: SPACING.m, borderRadius: 12, marginBottom: SPACING.s, alignItems: 'center', ...SHADOWS.small },
  imagePlaceholder: { width: 60, height: 60, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemCategory: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  statusContainer: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: "#000", shadowOpacity: 0.3, shadowOffset: {width: 0, height: 2} }
});