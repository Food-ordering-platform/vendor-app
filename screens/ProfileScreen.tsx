import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, 
  Image, Alert, ActivityIndicator, Switch 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext'; // Ensure you created this from the previous step
import { SPACING, SHADOWS } from '../constants/theme';

export default function ProfileScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, setMode } = useTheme(); // Use the theme hook
  
  // Check if we are in "Onboarding Mode" (coming from Signup)
  const isOnboarding = route?.params?.isOnboarding || false;

  // Form State
  const [name, setName] = useState(isOnboarding ? "" : "Mama's Kitchen");
  const [address, setAddress] = useState(isOnboarding ? "" : "123 Main Street, Warri");
  const [phone, setPhone] = useState(isOnboarding ? "" : "08012345678");
  const [prepTime, setPrepTime] = useState(isOnboarding ? "30" : "25"); 
  const [image, setImage] = useState<string | null>(
    isOnboarding ? null : "https://res.cloudinary.com/dnq5zkskt/image/upload/v1758018670/Aj_takeaway_le3f7d.webp"
  );
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isOnboarding); 

  // --- Image Picker Logic ---
  const pickImage = async () => {
    if (!isEditing) return; 

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // --- Save Logic ---
  const handleSave = () => {
    // Basic Validation
    if (!name || !address || !phone || !prepTime) {
      Alert.alert("Missing Info", "Please fill in all details.");
      return;
    }
    
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      
      if (isOnboarding) {
        // If onboarding, replace the entire stack with the Dashboard
        navigation.replace('Main'); 
      } else {
        setIsEditing(false);
        Alert.alert("Success", "Restaurant Profile Updated!");
      }
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* --- CUSTOM HEADER --- */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 10, 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border
      }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isOnboarding ? "Setup Restaurant" : "Restaurant Profile"}
        </Text>
        
        {!isOnboarding && (
          <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
            <Text style={[styles.editBtn, { color: isEditing ? colors.success : colors.primary }]}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Hero Image Section --- */}
        <TouchableOpacity onPress={pickImage} activeOpacity={isEditing ? 0.7 : 1}>
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.coverImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: isDark ? '#374151' : '#FCE7F3' }]}>
                <Ionicons name="camera" size={50} color={colors.primary} />
                <Text style={[styles.placeholderText, { color: colors.primary }]}>Tap to add cover photo</Text>
              </View>
            )}
            
            {isEditing && (
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          {isOnboarding && (
             <Text style={[styles.onboardingHint, { color: colors.textLight }]}>
               Almost done! Tell customers about your place.
             </Text>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Details</Text>
          
          {/* 1. Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textLight }]}>Restaurant Name</Text>
            <TextInput
              style={[
                styles.input, 
                { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                !isEditing && styles.disabledInput
              ]}
              value={name}
              onChangeText={setName}
              editable={isEditing}
              placeholder="e.g. Mama's Pot"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* 2. Address Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textLight }]}>Address</Text>
            <TextInput
              style={[
                styles.input, 
                { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                !isEditing && styles.disabledInput
              ]}
              value={address}
              onChangeText={setAddress}
              editable={isEditing}
              multiline
              placeholder="Where is your kitchen located?"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.row}>
            {/* 3. Phone Input */}
            <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.m }]}>
              <Text style={[styles.label, { color: colors.textLight }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                  !isEditing && styles.disabledInput
                ]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="080..."
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* 4. Prep Time Input */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textLight }]}>Avg Prep Time (mins)</Text>
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                  !isEditing && styles.disabledInput
                ]}
                value={prepTime}
                onChangeText={setPrepTime}
                editable={isEditing}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          {/* Status Card (Only show if NOT onboarding) */}
          {!isOnboarding && (
            <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
              <View>
                <Text style={[styles.statusTitle, { color: colors.text }]}>Restaurant Status</Text>
                <Text style={[styles.statusSub, { color: colors.textLight }]}>Currently visible to customers</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
                <Text style={{ color: colors.success, fontWeight: 'bold' }}>OPEN</Text>
              </View>
            </View>
          )}

          {/* Save Button (Only show in Edit Mode) */}
          {isEditing && (
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isOnboarding ? "Complete Setup & Go to Dashboard" : "Save Changes"}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* --- APP SETTINGS (Dark Mode Toggle) --- */}
          {!isOnboarding && (
            <View style={{ marginTop: 30 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
              
              <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="moon" size={22} color={colors.text} style={{ marginRight: 12 }} />
                  <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>Dark Mode</Text>
                </View>
                
                <Switch 
                  value={isDark}
                  onValueChange={(val) => setMode(val ? 'dark' : 'light')}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={'#f4f3f4'}
                />
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.l, 
    borderBottomWidth: 1, 
    ...SHADOWS.small
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  editBtn: { fontSize: 16, fontWeight: '600' },

  imageContainer: { height: 200, width: '100%', position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { 
    width: '100%', height: '100%', 
    justifyContent: 'center', alignItems: 'center' 
  },
  placeholderText: { marginTop: 10, fontWeight: '600' },
  cameraOverlay: {
    position: 'absolute', bottom: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20
  },

  formContainer: { padding: SPACING.l },
  onboardingHint: { fontSize: 16, marginBottom: SPACING.l, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.m },
  
  inputGroup: { marginBottom: SPACING.m },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: { 
    borderWidth: 1,
    borderRadius: 8, padding: 12, fontSize: 16 
  },
  disabledInput: { opacity: 0.7, borderWidth: 0 },
  row: { flexDirection: 'row' },

  statusCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.m, borderRadius: 12,
    marginTop: SPACING.s, ...SHADOWS.small
  },
  statusTitle: { fontSize: 16, fontWeight: 'bold' },
  statusSub: { fontSize: 13 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },

  settingsCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 12, ...SHADOWS.small
  },

  saveButton: {
    padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: SPACING.xl, ...SHADOWS.medium
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});