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
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.dishImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Ionicons name="restaurant" size={40} color={colors.textLight} />
            </View>
          )}
          
          {/* Status Badge Overlay */}
          <View style={[styles.statusBadgeOverlay, { 
            backgroundColor: item.available ? colors.success : colors.danger 
          }]}>
            <Ionicons 
              name={item.available ? "checkmark-circle" : "close-circle"} 
              size={14} 
              color="white" 
            />
            <Text style={styles.statusBadgeText}>
              {item.available ? 'Available' : 'Out'}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.itemContent}>
          {/* Header Row */}
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleSection}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.categoryBadge}>
                <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category?.name || 'General'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.priceBox, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                ₦{item.price.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            {/* Toggle Switch */}
            <View style={styles.toggleSection}>
              <Switch
                trackColor={{ false: "#D1D5DB", true: colors.success + '50' }}
                thumbColor={item.available ? colors.success : "#9CA3AF"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={() => toggleItem(item.id)}
                value={item.available}
                disabled={isToggling}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
              <View style={styles.toggleTextSection}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Availability
                </Text>
                <Text style={[styles.toggleStatus, { 
                  color: item.available ? colors.success : colors.textLight 
                }]}>
                  {item.available ? 'In Stock' : 'Sold Out'}
                </Text>
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity 
              onPress={() => handleDelete(item.id, item.name)}
              disabled={isDeleting}
              style={[styles.deleteBtn, { backgroundColor: colors.danger + '15' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Menu Management" showNotification={false} />

      {/* Quick Stats Bar */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="restaurant" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.text }]}>{menuItems.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Total Items</Text>
          </View>
        </View>
        
        <View style={[styles.statDivider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
        
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {menuItems.filter((i: any) => i.available).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Available</Text>
          </View>
        </View>
        
        <View style={[styles.statDivider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
        
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: colors.textLight + '15' }]}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {menuItems.filter((i: any) => !i.available).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Out of Stock</Text>
          </View>
        </View>
      </View>

      {isLoading && !menuItems.length ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList 
          data={menuItems}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="restaurant-outline" size={64} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No menu items yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>
                Start building your menu by adding your first delicious dish
              </Text>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AddMenuItem', { restaurantId })}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.emptyButtonText}>Add First Item</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddMenuItem', { restaurantId })}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.m,
    marginBottom: SPACING.m,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    borderRadius: 20,
    ...SHADOWS.small
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    marginHorizontal: 4
  },
  
  // List
  listContent: { 
    padding: SPACING.m, 
    paddingBottom: 100 
  },
  
  // Item Card
  itemCard: { 
    borderRadius: 20,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    ...SHADOWS.medium
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%'
  },
  dishImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  
  // Content Section
  itemContent: {
    padding: SPACING.m
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.m
  },
  itemTitleSection: {
    flex: 1,
    marginRight: SPACING.m
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start'
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  priceBox: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center'
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  
  divider: {
    height: 1,
    marginVertical: SPACING.m
  },
  
  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  toggleTextSection: {
    flex: 1
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  toggleStatus: {
    fontSize: 14,
    fontWeight: '700'
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // FAB
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  
  // Empty State
  emptyState: { 
    alignItems: 'center', 
    marginTop: 80,
    paddingHorizontal: 40
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  emptyTitle: { 
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center'
  },
  emptySubtitle: { 
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    ...SHADOWS.medium
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800'
  }
});