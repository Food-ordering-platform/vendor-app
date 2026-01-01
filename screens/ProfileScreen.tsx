import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator, Alert, Image, Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker'; 
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCreateRestaurant, useUpdateRestaurant } from '../services/restaurant/restaurant.queries';

export default function ProfileScreen({ navigation, route }: any) {
  const { user, logout } = useAuth();
  const { colors, isDark, setMode } = useTheme();
  
  const isSetupMode = route.params?.isOnboarding || false;
  const hasRestaurant = !!user?.restaurant?.id;

  // Form State
  const [restaurantName, setRestaurantName] = useState(user?.restaurant?.name || "");
  const [address, setAddress] = useState(user?.restaurant?.address || "");
  const [phone, setPhone] = useState(user?.restaurant?.phone || user?.phone || "");
  const [prepTime, setPrepTime] = useState(user?.restaurant?.prepTime?.toString() || "20");
  const [email, setEmail] = useState(user?.restaurant?.email || user?.email || ""); 
  const [isOpen, setIsOpen] = useState(user?.restaurant?.isOpen ?? true);
  
  // Image State
  const [image, setImage] = useState(user?.restaurant?.imageUrl || null); 
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  // Hooks
  const { mutate: createRestaurant, isPending: isCreating } = useCreateRestaurant();
  const { mutate: updateRestaurant, isPending: isUpdating } = useUpdateRestaurant();
  const isPending = isCreating || isUpdating;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!restaurantName || !address || !phone || !email) {
      Alert.alert("Missing Info", "Please fill in all details.");
      return;
    }

    const payload = {
      name: restaurantName,
      address,
      phone,
      email,
      prepTime,
      isOpen,
      imageUri: newImageUri
    };

    const onSuccess = () => {
       Alert.alert("Success", hasRestaurant ? "Profile Updated!" : "Restaurant is Live!");
       if (isSetupMode || !hasRestaurant) {
          navigation.replace('Main');
       }
    };

    if (hasRestaurant) {
      if (!user?.restaurant?.id) {
        Alert.alert("Error", "Restaurant ID not found. Please restart the app.");
        return;
      }

      updateRestaurant(
        { id: user.restaurant.id, data: payload }, 
        { onSuccess }
      );
    } else {
      createRestaurant(payload, { onSuccess });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* --- COVER IMAGE --- */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
          <View style={styles.coverSection}>
            {image ? (
              <Image source={{ uri: image }} style={styles.coverImage} />
            ) : (
              <View style={[styles.coverPlaceholder, { backgroundColor: colors.surface }]}>
                <View style={[styles.cameraCircle, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="camera" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.addPhotoText, { color: colors.primary }]}>
                  Add Restaurant Cover
                </Text>
                <Text style={[styles.addPhotoSubtext, { color: colors.textLight }]}>
                  Recommended: 1200 x 600px
                </Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <View style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="white" />
                <Text style={styles.editText}>Change Photo</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* --- HEADER --- */}
        <View style={styles.headerSection}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>
            {hasRestaurant ? "Restaurant Profile" : "Setup Your Kitchen"}
          </Text>
          <Text style={[styles.screenSubtitle, { color: colors.textLight }]}>
            {hasRestaurant ? "Manage your restaurant information" : "Let's get your restaurant online"}
          </Text>
        </View>

        {/* --- FORM CONTENT --- */}
        <View style={styles.formContainer}>
          
          {/* Restaurant Details Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Restaurant Details
              </Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Restaurant Name</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border, 
                  color: colors.text, 
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB'
                }]}
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder="e.g., Mama's Kitchen"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border, 
                  color: colors.text, 
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB'
                }]}
                value={address}
                onChangeText={setAddress}
                placeholder="123 Main Street, City"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Contact Information
              </Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: colors.border, 
                  color: colors.text, 
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB'
                }]}
                value={email}
                onChangeText={setEmail}
                placeholder="business@restaurant.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { 
                    borderColor: colors.border, 
                    color: colors.text, 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB'
                  }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+234 800 000 0000"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Prep Time (min)</Text>
                <TextInput
                  style={[styles.input, { 
                    borderColor: colors.border, 
                    color: colors.text, 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB'
                  }]}
                  value={prepTime}
                  onChangeText={setPrepTime}
                  placeholder="20"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
          </View>

          {/* Settings Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Settings
              </Text>
            </View>

            <View style={[styles.toggleItem, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <View style={styles.toggleInfo}>
                <View style={[styles.toggleIconBox, { 
                  backgroundColor: isOpen ? colors.success + '20' : colors.textLight + '20' 
                }]}>
                  <Ionicons 
                    name={isOpen ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={isOpen ? colors.success : colors.textLight} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>
                    Restaurant Status
                  </Text>
                  <Text style={[styles.toggleSubtitle, { 
                    color: isOpen ? colors.success : colors.textLight 
                  }]}>
                    {isOpen ? "Currently accepting orders" : "Closed for orders"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: "#D1D5DB", true: colors.success + '60' }}
                thumbColor={isOpen ? colors.success : "#9CA3AF"}
              />
            </View>

            <View style={[styles.toggleItem, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <View style={styles.toggleInfo}>
                <View style={[styles.toggleIconBox, { 
                  backgroundColor: isDark ? '#FCD34D20' : colors.primary + '20'
                }]}>
                  <Ionicons 
                    name={isDark ? "moon" : "sunny"} 
                    size={20} 
                    color={isDark ? '#FCD34D' : colors.primary} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.toggleSubtitle, { color: colors.textLight }]}>
                    {isDark ? "Dark theme enabled" : "Light theme enabled"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => setMode(val ? 'dark' : 'light')}
                trackColor={{ false: "#D1D5DB", true: colors.primary + '60' }}
                thumbColor={isDark ? colors.primary : "#9CA3AF"}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons 
                  name={hasRestaurant ? "checkmark-circle" : "rocket"} 
                  size={20} 
                  color="white" 
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>
                  {hasRestaurant ? "Save Changes" : "Launch Restaurant"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={logout} 
            style={[styles.logoutButton, { backgroundColor: colors.danger + '15' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Cover Section
  coverSection: { 
    height: 220, 
    position: 'relative',
    marginBottom: SPACING.l
  },
  coverImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  coverPlaceholder: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cameraCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  addPhotoText: { 
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  addPhotoSubtext: {
    fontSize: 12,
    fontWeight: '500'
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  editText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700'
  },
  
  // Header
  headerSection: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l
  },
  screenTitle: { 
    fontSize: 28, 
    fontWeight: '800',
    marginBottom: 6
  },
  screenSubtitle: {
    fontSize: 15,
    lineHeight: 22
  },
  
  // Form
  formContainer: { 
    paddingHorizontal: SPACING.m,
    gap: SPACING.m
  },
  section: {
    borderRadius: 20,
    padding: SPACING.l,
    ...SHADOWS.small
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.l,
    gap: 10
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  
  // Inputs
  inputWrapper: { marginBottom: SPACING.m },
  inputLabel: { 
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: { 
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    fontWeight: '500'
  },
  row: { flexDirection: 'row' },
  
  // Toggles
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    marginBottom: SPACING.m
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  toggleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  toggleSubtitle: {
    fontSize: 13,
    fontWeight: '500'
  },
  
  // Buttons
  saveButton: { 
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium
  },
  saveButtonText: { 
    color: 'white',
    fontSize: 16,
    fontWeight: '800'
  },
  logoutButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700'
  }
});