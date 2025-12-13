// food-ordering-platform/vendor-app/vendor-app-work-branch/screens/ProfileScreen.tsx

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

    // Clean Payload
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
      // [FIX] Safety check to ensure ID exists
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- COVER IMAGE --- */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.coverImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.surface }]}>
                <Ionicons name="camera" size={40} color={COLORS.primary} />
                <Text style={[styles.addPhotoText, { color: COLORS.primary }]}>Add Cover Photo</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={14} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* --- CONTENT --- */}
        <View style={styles.content}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {hasRestaurant ? "Edit Profile" : "Setup Kitchen"}
          </Text>

          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Restaurant Name</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder="Mama's Kitchen"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Address</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={address}
                onChangeText={setAddress}
                placeholder="123 Main St"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={email}
                onChangeText={setEmail}
                placeholder="business@mail.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone & Prep Time */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
                    <TextInput
                        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholderTextColor={colors.textLight}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
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

            {/* --- TOGGLES --- */}
            <View style={{ marginTop: 10 }}>
                {/* Status Toggle */}
                <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View>
                        <Text style={[styles.toggleTitle, { color: colors.text }]}>Restaurant Status</Text>
                        <Text style={{ color: isOpen ? COLORS.success : COLORS.textLight, fontSize: 12 }}>
                            {isOpen ? "Currently Open" : "Closed"}
                        </Text>
                    </View>
                    <Switch
                        value={isOpen}
                        onValueChange={setIsOpen}
                        trackColor={{ false: "#767577", true: COLORS.primary }}
                        thumbColor={"#f4f3f4"}
                    />
                </View>

                {/* Dark Mode Toggle */}
                <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View>
                        <Text style={[styles.toggleTitle, { color: colors.text }]}>Dark Mode</Text>
                        <Text style={{ color: colors.textLight, fontSize: 12 }}>
                            {isDark ? "Dark Theme" : "Light Theme"}
                        </Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={(val) => setMode(val ? 'dark' : 'light')}
                        trackColor={{ false: "#767577", true: COLORS.primary }}
                        thumbColor={"#f4f3f4"}
                    />
                </View>
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
                {hasRestaurant ? "Save Changes" : "Go Live"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={{ color: COLORS.danger, fontWeight: 'bold' }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { height: 200, width: '100%', position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  addPhotoText: { marginTop: 8, fontWeight: '600', fontSize: 14 },
  editBadge: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  content: { padding: SPACING.l },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  form: { gap: 15 },
  inputGroup: { marginBottom: 5 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, opacity: 0.8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  row: { flexDirection: 'row' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  toggleTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  saveButton: { marginTop: 20, paddingVertical: 18, borderRadius: 12, alignItems: 'center', ...SHADOWS.medium },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { alignItems: 'center', marginTop: 25, padding: 10 }
});