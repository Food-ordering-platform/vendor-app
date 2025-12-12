import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCreateRestaurant, useUpdateRestaurant } from '../services/restaurant/restaurant.queries';

export default function ProfileScreen({ navigation, route }: any) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  
  const isSetupMode = route.params?.isOnboarding || false;
  const hasRestaurant = !!user?.restaurant?.id;

  const [restaurantName, setRestaurantName] = useState(user?.restaurant?.name || "");
  const [address, setAddress] = useState(user?.restaurant?.address || "");
  const [phone, setPhone] = useState(user?.restaurant?.phone || user?.phone || "");
  const [prepTime, setPrepTime] = useState(user?.restaurant?.prepTime?.toString() || "20");
  const [email, setEmail] = useState(user?.restaurant?.email || " ");

  const { mutate: createRestaurant, isPending: isCreating } = useCreateRestaurant();
  const { mutate: updateRestaurant, isPending: isUpdating } = useUpdateRestaurant();
  const isPending = isCreating || isUpdating;

  const handleSave = () => {
    if (!restaurantName || !address || !phone) {
      Alert.alert("Missing Info", "Please fill in all details.");
      return;
    }

    const payload = {
      name: restaurantName,
      address,
      phone,
      prepTime: parseInt(prepTime) || 20,
      isOpen: true,
    };

    if (hasRestaurant) {
      updateRestaurant({ id: user?.restaurant?.id!, data: payload }, {
        onSuccess: () => {
           Alert.alert("Success", "Profile Updated!");
           // If we were in setup mode, this will now trigger App.tsx to switch to Main
        }
      });
    } else {
      createRestaurant(payload, {
        onSuccess: () => {
           Alert.alert("Success", "Restaurant is now Live!");
           // This updates the user context -> App.tsx sees restaurant -> Switches to Main tabs
        }
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- 1. CLEAN HEADER (Previous Design Style) --- */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {hasRestaurant ? "My Kitchen" : "Setup Kitchen"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {hasRestaurant ? "Manage your profile details" : "Let's get your business online"}
          </Text>
        </View>

        {/* --- 2. IMAGE SECTION --- */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="storefront" size={50} color={colors.primary} />
          </View>
          <TouchableOpacity style={styles.changeLogoBtn}>
            <Ionicons name="camera" size={16} color="white" />
            <Text style={styles.changeLogoText}>Upload Logo</Text>
          </TouchableOpacity>
        </View>

        {/* --- 3. FORM --- */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Restaurant Name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="e.g. Mama's Kitchen"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 123 Main St"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. vendor@gmail.com"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Prep Time (Mins)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        {/* --- 4. ACTION BUTTON --- */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasRestaurant ? "Update Profile" : "Go Live"}
            </Text>
          )}
        </TouchableOpacity>

        {/* --- 5. LOGOUT BUTTON (Added as requested) --- */}
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
          <Text style={{ color: COLORS.danger, fontWeight: 'bold', fontSize: 16 }}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.l, paddingBottom: 40 },
  
  headerContainer: { marginBottom: SPACING.xl, marginTop: SPACING.m },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 5 },

  imageContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  imagePlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 15
  },
  changeLogoBtn: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 16, 
    borderRadius: 20 
  },
  changeLogoText: { color: 'white', fontWeight: '600', marginLeft: 6 },

  form: { gap: 15 },
  inputGroup: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },

  saveButton: {
    marginTop: 30, paddingVertical: 18, borderRadius: 12,
    alignItems: 'center', ...SHADOWS.medium
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  logoutButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 30, padding: 15 
  }
});