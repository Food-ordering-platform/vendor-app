import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  Switch, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, SHADOWS } from '../constants/theme';
import Header from '../components/HeaderTemp';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';
// Import the new hooks
import { 
  useGetMenuItems, 
  useToggleMenuItem, 
  useDeleteMenuItem 
} from '../services/restaurant/restaurant.queries';

export default function MenuScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const restaurantId = user?.restaurant?.id;

  // 1. Data Hooks
  const { data: menuResponse, isLoading, refetch, isRefetching } = useGetMenuItems(restaurantId || "");
  const { mutate: toggleItem, isPending: isToggling } = useToggleMenuItem();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteMenuItem();
  
  const menuItems = menuResponse?.data || [];

  // 2. Handlers
  const handleDelete = (itemId: string, name: string) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to remove "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteItem(itemId) 
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
        
        {/* Image Section */}
        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
          {item.imageUrl ? (
             <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
             <Ionicons name="fast-food" size={24} color={colors.textLight} />
          )}
        </View>

        {/* Info Section */}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemCategory, { color: colors.textLight }]}>
             {item.category?.name || 'General'}
          </Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>
            ₦{item.price.toLocaleString()}
          </Text>
        </View>

        {/* Actions Section (Switch & Delete) */}
        <View style={styles.actions}>
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: item.available ? colors.success : colors.textLight }]}>
              {item.available ? 'In Stock' : 'Sold Out'}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: colors.primary + '80' }} // Light opacity primary
              thumbColor={item.available ? colors.primary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleItem(item.id)}
              value={item.available}
              disabled={isToggling}
            />
          </View>

          <TouchableOpacity 
            onPress={() => handleDelete(item.id, item.name)}
            disabled={isDeleting}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Menu Management" showNotification={false} />

      {isLoading && !menuItems.length ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList 
          data={menuItems}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: SPACING.m, paddingBottom: 100 }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="fast-food-outline" size={50} color={colors.textLight} />
              <Text style={{ color: colors.textLight, marginTop: 10 }}>
                No menu items yet.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB to Add Item */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddMenuItem', { restaurantId })}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCard: { 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 12, 
    alignItems: 'center', 
    ...SHADOWS.small 
  },
  imagePlaceholder: { 
    width: 60, 
    height: 60, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12,
    overflow: 'hidden'
  },
  image: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  itemCategory: { fontSize: 12, marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '700' },
  
  actions: { alignItems: 'flex-end', gap: 8 },
  switchContainer: { alignItems: 'flex-end' },
  switchLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  deleteBtn: { padding: 4 },
  
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 5, 
    shadowColor: "#000", 
    shadowOpacity: 0.3, 
    shadowOffset: {width: 0, height: 2} 
  }
});