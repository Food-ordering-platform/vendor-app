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
  Alert,
  ScrollView,
  Platform // 👈 Import Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, SHADOWS, COLORS } from '../constants/theme'; // Ensure COLORS is imported
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

  // 2. 🟢 ROBUST DELETE HANDLER (PWA Friendly)
  const handleDelete = (itemId: string, name: string) => {
    if (Platform.OS === 'web') {
      // PWA / Web: Use browser confirm because it's reliable
      const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
      if (confirmed) {
        deleteItem(itemId);
      }
    } else {
      // Native (iOS/Android): Use native Alert with destructive style
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
    }
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
          
          {/* Status Badge */}
          <View style={[styles.statusBadgeOverlay, { 
            backgroundColor: item.available ? colors.success : colors.danger 
          }]}>
            <Text style={styles.statusBadgeText}>
              {item.available ? 'Active' : 'Hidden'}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleSection}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {item.category?.name || 'General'}
              </Text>
            </View>
            <View style={[styles.priceBox, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                ₦{item.price.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />

          <View style={styles.actionsRow}>
            {/* Availability Toggle */}
            <View style={styles.toggleSection}>
              <Switch
                trackColor={{ false: "#D1D5DB", true: colors.success + '50' }}
                thumbColor={item.available ? colors.success : "#9CA3AF"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={() => toggleItem(item.id)}
                value={item.available}
                disabled={isToggling}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <Text style={[styles.toggleStatus, { 
                color: item.available ? colors.success : colors.textLight 
              }]}>
                {item.available ? 'Online' : 'Offline'}
              </Text>
            </View>

            {/* 🟢 DELETE BUTTON */}
            <TouchableOpacity 
              onPress={() => handleDelete(item.id, item.name)}
              disabled={isDeleting}
              style={[styles.deleteBtn, { backgroundColor: colors.danger + '10' }]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Menu" subtitle="Manage your dishes" showNotification={false} />

      {/* --- RESPONSIVE QUICK STATS (Horizontal Scroll) --- */}
      <View style={styles.statsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContent}
        >
          {/* Card 1: Total Items */}
          <View style={[styles.statCardNew, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconBoxNew, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="fast-food" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.statValueNew, { color: colors.text }]}>{menuItems.length}</Text>
              <Text style={[styles.statLabelNew, { color: colors.textLight }]}>Total Dishes</Text>
            </View>
          </View>

          {/* Card 2: Active */}
          <View style={[styles.statCardNew, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconBoxNew, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.statValueNew, { color: colors.text }]}>
                {menuItems.filter((i: any) => i.available).length}
              </Text>
              <Text style={[styles.statLabelNew, { color: colors.textLight }]}>Active</Text>
            </View>
          </View>

          {/* Card 3: Inactive */}
          <View style={[styles.statCardNew, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconBoxNew, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={20} color={colors.danger} />
            </View>
            <View>
              <Text style={[styles.statValueNew, { color: colors.text }]}>
                {menuItems.filter((i: any) => !i.available).length}
              </Text>
              <Text style={[styles.statLabelNew, { color: colors.textLight }]}>Sold Out</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Main Content */}
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
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="restaurant-outline" size={50} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Empty Menu</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>
                Add your first dish to start selling.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
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

  // --- STATS STYLES ---
  statsWrapper: {
    height: 85, 
    marginBottom: SPACING.s,
    marginTop: SPACING.s,
  },
  statsScrollContent: {
    paddingHorizontal: SPACING.m,
    paddingRight: SPACING.l,
    alignItems: 'center', 
  },
  statCardNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 150,   
    ...SHADOWS.small,
  },
  statIconBoxNew: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValueNew: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabelNew: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- LIST STYLES ---
  listContent: { 
    padding: SPACING.m, 
    paddingBottom: 100 
  },
  itemCard: { 
    borderRadius: 20,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    ...SHADOWS.small 
  },
  imageContainer: {
    position: 'relative',
    height: 160, 
    width: '100%'
  },
  dishImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  
  statusBadgeOverlay: {
    position: 'absolute',
    top: 10, right: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: { color: 'white', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  itemContent: { padding: 14 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitleSection: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  categoryText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  
  priceBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  priceValue: { fontSize: 15, fontWeight: '800' },

  divider: { height: 1, marginVertical: 12, opacity: 0.5 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleStatus: { fontSize: 13, fontWeight: '600' },
  
  deleteBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // Empty State
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  fab: { 
    position: 'absolute', bottom: 30, right: 20, 
    width: 60, height: 60, borderRadius: 30, 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8
  },
});