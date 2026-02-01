import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator,  Image, Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker'; 
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCreateRestaurant, useUpdateRestaurant } from '../services/restaurant/restaurant.queries';
import { CommonActions } from '@react-navigation/native';
import { toast } from '../components/ui/Toast'; // 👈 1. Import Toast

export default function ProfileScreen({ navigation, route }: any) {
  const { user, logout, refreshUser } = useAuth();
  const { colors, isDark } = useTheme();
  
  const hasRestaurant = !!user?.restaurant?.id;

  const [restaurantName, setRestaurantName] = useState(user?.restaurant?.name || "");
  const [address, setAddress] = useState(user?.restaurant?.address || "");
  const [phone, setPhone] = useState(user?.restaurant?.phone || user?.phone || "");
  const [prepTime, setPrepTime] = useState(user?.restaurant?.prepTime?.toString() || "20");
  const [email, setEmail] = useState(user?.restaurant?.email || user?.email || ""); 
  const [isOpen, setIsOpen] = useState(user?.restaurant?.isOpen ?? true);
  
  const [coordinates, setCoordinates] = useState({
    lat: user?.restaurant?.latitude || 0,
    lng: user?.restaurant?.longitude || 0
  });
  
  const [image, setImage] = useState(user?.restaurant?.imageUrl || null); 
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  const { mutate: createRestaurant, isPending: isCreating } = useCreateRestaurant();
  const { mutate: updateRestaurant, isPending: isUpdating } = useUpdateRestaurant();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (route.params?.draftData) {
        const { name, phone, email, prepTime, imageUri } = route.params.draftData;
        if (name) setRestaurantName(name);
        if (phone) setPhone(phone);
        if (email) setEmail(email);
        if (prepTime) setPrepTime(prepTime);
        if (imageUri) {
            setImage(imageUri);
            setNewImageUri(imageUri);
        }
    }

    if (route.params?.selectedAddress) {
      setAddress(route.params.selectedAddress);
      setCoordinates({
        lat: route.params.selectedLat,
        lng: route.params.selectedLng
      });
    }
  }, [route.params]);

  const goToMap = () => {
    navigation.navigate('SetupLocation', {
        draftData: {
            name: restaurantName,
            phone,
            email,
            prepTime,
            imageUri: newImageUri || image 
        }
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Permission Denied', { description: 'We need access to your gallery.' });
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
      toast.error("Missing Info", { description: "Please fill in all details." }); // 👈 Toast Error
      return;
    }

    const payload = {
      name: restaurantName,
      address,
      phone,
      email,
      prepTime,
      isOpen,
      imageUri: newImageUri,
      latitude: coordinates.lat,
      longitude: coordinates.lng 
    };

    const onSuccess = async () => {
       await refreshUser(); 

       // 🟢 Success Toast
       const message = hasRestaurant ? "Profile Updated Successfully!" : "Restaurant Launched Successfully!";
       toast.success(message);

       if (!hasRestaurant) {
           navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Orders' } }],
            })
          );
       }
    };

    if (hasRestaurant) {
      if (!user?.restaurant?.id) {
        toast.error("Error", { description: "Restaurant ID not found. Please restart app." });
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

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={goToMap}
              >
                <View style={[styles.input, { 
                  borderColor: colors.border, 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB'
                }]}>
                  <Ionicons name="location" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
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

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Info</Text>
            </View>

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
                autoCapitalize="none"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Prep Time (mins)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder="20"
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
             <View style={styles.sectionHeader}>
                <Ionicons name="settings" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
             </View>
             <View style={[styles.toggleItem, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
                <Text style={{color: colors.text, fontWeight: '600', fontSize: 15}}>Accepting Orders</Text>
                <Switch
                    value={isOpen}
                    onValueChange={setIsOpen}
                    trackColor={{ false: "#D1D5DB", true: colors.success + '80' }}
                    thumbColor={isOpen ? colors.success : "#9CA3AF"}
                />
             </View>
          </View>

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

          <TouchableOpacity 
            onPress={logout} 
            style={[styles.logoutButton, { backgroundColor: colors.danger + '15' }]}
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
  toggleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0 },
  saveButton: { padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10, ...SHADOWS.medium },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8, marginTop: 10 },
  logoutText: { fontSize: 15, fontWeight: '700' }
});