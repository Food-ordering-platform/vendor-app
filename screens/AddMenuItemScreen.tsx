import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';
import { useAddMenuItem } from '../services/restaurant/restaurant.queries';

export default function AddMenuItemScreen({ navigation, route }: any) {
  // 1. Get restaurantId passed from MenuScreen
  const { restaurantId } = route.params || {};

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // 2. Use the Mutation Hook
  const { mutate, isPending } = useAddMenuItem();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!name || !price || !category || !image) {
      Alert.alert('Error', 'Please fill all fields and add an image');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Error', 'Restaurant ID missing. Please restart.');
      return;
    }

    // 3. Trigger Mutation
    mutate(
      {
        restaurantId,
        data: {
          name,
          description: desc,
          price,
          categoryName: category,
          imageUri: image,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Menu Item Added!');
          navigation.goBack();
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* --- CUSTOM HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTextSection}>
          <Text style={styles.headerTitle}>Add Menu Item</Text>
          <Text style={styles.headerSubtitle}>Create a new dish</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- IMAGE UPLOAD SECTION --- */}
        <TouchableOpacity 
          style={styles.imageUploadSection} 
          onPress={pickImage}
          activeOpacity={0.9}
        >
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <View style={styles.changePhotoButton}>
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.cameraIconCircle}> 
                <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadText}>Upload Dish Photo</Text>
              <Text style={styles.uploadSubtext}>Tap to select from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* --- FORM SECTION --- */}
        <View style={styles.formSection}>
          
          {/* Dish Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="restaurant" size={18} color={COLORS.primary} />
              <Text style={styles.label}>Dish Name</Text>
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Jollof Rice Special"
              value={name}
              onChangeText={setName}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text" size={18} color={COLORS.primary} />
              <Text style={styles.label}>Description</Text>
            </View>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Describe the ingredients..."
              multiline
              value={desc}
              onChangeText={setDesc}
              numberOfLines={4}
              placeholderTextColor={COLORS.textLight}
              textAlignVertical="top"
            />
          </View>

          {/* Price & Category Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <View style={styles.labelRow}>
                <Ionicons name="cash" size={18} color={COLORS.primary} />
                <Text style={styles.label}>Price (₦)</Text>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput 
                  style={styles.priceInput} 
                  placeholder="2500"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.labelRow}>
                <Ionicons name="pricetag" size={18} color={COLORS.primary} />
                <Text style={styles.label}>Category</Text>
              </View>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Rice"
                value={category}
                onChangeText={setCategory}
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isPending && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Add to Menu</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              High-quality images increase orders by 30%!
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    // Header Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTextSection: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },

  scrollView: { flex: 1 },

  // --- IMAGE STYLES ---
  imageUploadSection: { 
    height: 240,
    margin: SPACING.m,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  imagePreviewContainer: { width: '100%', height: '100%', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center'
  },
  changePhotoButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  changePhotoText: { color: 'white', fontSize: 14, fontWeight: '700' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  cameraIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.05)', // Fixed Color Crash
    justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  uploadText: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  uploadSubtext: { color: COLORS.textLight, fontSize: 13, fontWeight: '500' },

  // --- FORM STYLES ---
  formSection: { padding: SPACING.m },
  inputGroup: { marginBottom: SPACING.l },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  input: { 
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500'
  },
  textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },

  // Price Input Specifics
  priceInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingLeft: 16,
    overflow: 'hidden'
  },
  currencySymbol: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginRight: 8 },
  priceInput: { flex: 1, padding: 16, paddingLeft: 0, fontSize: 15, color: COLORS.text, fontWeight: '600' },

  // Submit Button
  submitButton: { 
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: SPACING.m,
    // Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  submitButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

  // Info Card
  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, marginTop: SPACING.l, gap: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderColor: 'rgba(0,0,0,0.05)'
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20, fontWeight: '500' }
});