import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Image Upload Section */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.imageText}>Tap to upload dish photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={styles.label}>Dish Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Jollof Rice Special"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Describe the ingredients..."
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Price (₦)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="2500"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Category</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Rice, Drinks"
              value={category}
              onChangeText={setCategory}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, isPending && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Add to Menu</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imagePicker: { height: 200, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.l },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imageText: { color: COLORS.textLight, marginTop: SPACING.xs },
  form: { padding: SPACING.m },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: SPACING.m, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  button: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: SPACING.m },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});