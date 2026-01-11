import React, { useState, useEffect } from 'react';
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
  
  // 📍 NEW: Coordinates State
  const [coordinates, setCoordinates] = useState({
    lat: user?.restaurant?.latitude || 0,
    lng: user?.restaurant?.longitude || 0
  });
  
  // Image State
  const [image, setImage] = useState(user?.restaurant?.imageUrl || null); 
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  // Hooks
  const { mutate: createRestaurant, isPending: isCreating } = useCreateRestaurant();
  const { mutate: updateRestaurant, isPending: isUpdating } = useUpdateRestaurant();
  const isPending = isCreating || isUpdating;

  // 🔄 NEW: Listen for data coming back from the Map Screen
  useEffect(() => {
    if (route.params?.selectedAddress) {
      setAddress(route.params.selectedAddress);
      setCoordinates({
        lat: route.params.selectedLat,
        lng: route.params.selectedLng
      });
    }
  }, [route.params]);

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

    // 🚀 We now include latitude and longitude in the payload
    const payload = {
      name: restaurantName,
      address,
      phone,
      email,
      prepTime,
      isOpen,
      imageUri: newImageUri,
      latitude: coordinates.lat,  // Important for Geolocation
      longitude: coordinates.lng 
    };

    const onSuccess = () => {
       Alert.alert("Success", hasRestaurant ? "Profile Updated!" : "Restaurant is Live!");
       if (isSetupMode || !hasRestaurant) {
          // Force reload or navigate
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
       }
    };

    if (hasRestaurant) {
      if (!user?.restaurant?.id) {
        Alert.alert("Error", "Restaurant ID not found. Please restart the app.");
        return;
      }
      updateRestaurant({ id: user.restaurant.id, data: payload }, { onSuccess });
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
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* --- FORM CONTENT --- */}
        <View style={styles.formContainer}>
          
          {/* Restaurant Details Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Restaurant Details</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Restaurant Name</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder="e.g., Mama's Kitchen"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* 📍 ADDRESS INPUT (NOW CLICKABLE) */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('SetupLocation')} // Opens Map Screen
              >
                <View style={[styles.input, { 
                  borderColor: colors.border, 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB'
                }]}>
                  <Ionicons 
                    name="location" 
                    size={18} 
                    color={COLORS.primary} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text 
                    style={{ 
                      color: address ? colors.text : colors.textLight,
                      flex: 1,
                      fontSize: 15
                    }} 
                    numberOfLines={1}
                  >
                    {address || "Tap to set location on map"}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
             {/* ... Keep existing Contact inputs (Phone, Email, Prep Time) ... */}
             <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+234..."
                keyboardType="phone-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="business@example.com"
                keyboardType="email-address"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>
                {hasRestaurant ? "Save Changes" : "Launch Restaurant"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverSection: { height: 200, marginBottom: SPACING.l },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  cameraCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  addPhotoText: { fontSize: 14, fontWeight: '700' },
  
  formContainer: { paddingHorizontal: SPACING.m, gap: SPACING.m },
  section: { borderRadius: 16, padding: SPACING.m, ...SHADOWS.small },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', opacity: 0.7 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  
  saveButton: { padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10, ...SHADOWS.medium },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },
});