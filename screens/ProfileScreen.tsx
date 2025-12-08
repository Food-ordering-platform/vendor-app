import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, 
  Image, Alert, ActivityIndicator, Platform, SafeAreaView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

export default function ProfileScreen() {
  // Mock initial data (Replace with API data later)
  const [name, setName] = useState("Mama's Kitchen");
  const [address, setAddress] = useState("123 Main Street, Warri");
  const [phone, setPhone] = useState("08012345678");
  const [prepTime, setPrepTime] = useState("25"); // mins
  const [image, setImage] = useState<string | null>("https://res.cloudinary.com/dnq5zkskt/image/upload/v1758018670/Aj_takeaway_le3f7d.webp");
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- Image Picker Logic ---
  const pickImage = async () => {
    if (!isEditing) return; // Only allow change in Edit mode

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Wide aspect ratio for restaurant headers
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // --- Save Logic ---
  const handleSave = () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      Alert.alert("Success", "Restaurant Profile Updated!");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant Profile</Text>
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
          <Text style={[styles.editBtn, isEditing && { color: COLORS.success }]}>
            {isEditing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Hero Image Section --- */}
        <TouchableOpacity onPress={pickImage} activeOpacity={isEditing ? 0.7 : 1}>
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="restaurant" size={50} color={COLORS.textLight} />
                <Text style={styles.placeholderText}>Tap to add cover photo</Text>
              </View>
            )}
            
            {/* Camera Overlay Icon (Only when editing) */}
            {isEditing && (
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={name}
              onChangeText={setName}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={address}
              onChangeText={setAddress}
              editable={isEditing}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.m }]}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Prep Time (mins)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={prepTime}
                onChangeText={setPrepTime}
                editable={isEditing}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* --- Status Card --- */}
          <View style={styles.statusCard}>
            <View>
              <Text style={styles.statusTitle}>Restaurant Status</Text>
              <Text style={styles.statusSub}>Currently visible to customers</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#ECFDF5' }]}>
              <Text style={{ color: COLORS.success, fontWeight: 'bold' }}>OPEN</Text>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.l, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  editBtn: { fontSize: 16, fontWeight: '600', color: COLORS.primary },

  imageContainer: { height: 200, width: '100%', position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { 
    width: '100%', height: '100%', backgroundColor: '#E5E7EB', 
    justifyContent: 'center', alignItems: 'center' 
  },
  placeholderText: { marginTop: 10, color: COLORS.textLight },
  cameraOverlay: {
    position: 'absolute', bottom: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 25
  },

  formContainer: { padding: SPACING.l },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.m },
  
  inputGroup: { marginBottom: SPACING.m },
  label: { fontSize: 13, color: COLORS.textLight, marginBottom: 6, fontWeight: '600' },
  input: { 
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.text 
  },
  disabledInput: { backgroundColor: '#F9FAFB', borderColor: 'transparent', color: '#374151' },
  row: { flexDirection: 'row' },

  statusCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, padding: SPACING.m, borderRadius: 12,
    marginTop: SPACING.s, ...SHADOWS.small
  },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  statusSub: { fontSize: 13, color: COLORS.textLight },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },

  saveButton: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: SPACING.xl, ...SHADOWS.medium
  },
  saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});