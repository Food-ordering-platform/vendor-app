// screens/AddMenuItemScreen.tsx
import React, {useState} from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

export default function AddMenuItemScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(''); // Text input for "Rice", "Drinks"
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Pick Image Logic
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

  // 2. Submit Logic (Mocked API Call)
  const handleSubmit = async () => {
    if (!name || !price || !category || !image) {
      Alert.alert('Error', 'Please fill all fields and add an image');
      return;
    }

    setLoading(true);

    // TODO: Replace with your actual axios call
    // const formData = new FormData();
    // formData.append('name', name); ...
    // await axios.post(...)

    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Menu Item Added!');
      navigation.goBack();
    }, 1500);
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
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
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