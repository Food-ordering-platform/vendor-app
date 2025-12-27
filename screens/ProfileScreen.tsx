import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator, Alert, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location'; 
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useUpdateRestaurant, useCreateRestaurant } from '../services/restaurant/restaurant.queries';

// Type for OpenStreetMap results
type AddressResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

export default function ProfileScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  // Detect if this is "Setup Mode" (No restaurant yet) or "Edit Mode"
  const hasRestaurant = !!user?.restaurant?.id;
  const isSetupMode = !hasRestaurant || route.params?.isOnboarding;

  // Form State
  const [restaurantName, setRestaurantName] = useState(user?.restaurant?.name || "");
  const [phone, setPhone] = useState(user?.restaurant?.phone || user?.phone || "");
  const [prepTime, setPrepTime] = useState(user?.restaurant?.prepTime?.toString() || "20");
  const [email, setEmail] = useState(user?.restaurant?.email || user?.email || ""); 
  
  // 👇 ADDRESS & LOCATION STATE
  const [address, setAddress] = useState(user?.restaurant?.address || "");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(
    user?.restaurant?.latitude && user?.restaurant?.longitude 
      ? { lat: user.restaurant.latitude, lng: user.restaurant.longitude }
      : null
  );
  
  // 👇 AUTOCOMPLETE STATE
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  // Hooks
  const { mutate: createRestaurant, isPending: isCreating } = useCreateRestaurant();
  const { mutate: updateRestaurant, isPending: isUpdating } = useUpdateRestaurant();
  const isPending = isCreating || isUpdating;

  // 🔎 1. SEARCH LOGIC (Debounced)
  useEffect(() => {
    if (!showSuggestions || address.length < 4) return;

    const timerId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
          { headers: { "User-Agent": "ChowEasyVendorApp/1.0" } }
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.log("Autocomplete error", error);
      } finally {
        setIsSearching(false);
      }
    }, 800); // 800ms delay

    return () => clearTimeout(timerId);
  }, [address, showSuggestions]);

  const onAddressChange = (text: string) => {
    setAddress(text);
    setShowSuggestions(true);
    if (location) setLocation(null); // Reset location if they edit text manually
  };

  const selectSuggestion = (item: AddressResult) => {
    Keyboard.dismiss();
    setAddress(item.display_name);
    setLocation({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // 📍 2. GPS LOGIC ("I'm at the shop")
  const getCurrentLocation = async () => {
    setIsLoadingGPS(true);
    setShowSuggestions(false);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to set your store address.');
        return;
      }
      
      let locationResult = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = locationResult.coords;
      
      setLocation({ lat: latitude, lng: longitude });
      
      // Reverse Geocode to fill the text box
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse.length > 0) {
        const addr = reverse[0];
        const formatted = `${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`;
        setAddress(formatted.trim());
      }
      
      Alert.alert("Success", "Location pinned via GPS!");
    } catch (error) {
      Alert.alert("Error", "Could not fetch GPS location.");
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const handleSave = () => {
    if (!restaurantName || !address || !phone) {
      Alert.alert("Missing Info", "Please fill in all details.");
      return;
    }
    if (!location) {
        Alert.alert("Location Required", "Please select an address from the dropdown or use the GPS button.");
        return;
    }

    const payload = {
      name: restaurantName,
      address,
      phone,
      email,
      prepTime: parseInt(prepTime),
      latitude: location.lat,
      longitude: location.lng,
      // FIX: Ensure isOpen is included to match the Type Definition
      isOpen: user?.restaurant?.isOpen ?? false 
    };

    const onSuccess = () => {
       Alert.alert("Success", hasRestaurant ? "Profile Updated!" : "Restaurant is Live!");
       // If this was setup, go to dashboard
       if (isSetupMode) navigation.replace('Main'); 
    };

    if (hasRestaurant && user?.restaurant?.id) {
      updateRestaurant({ id: user.restaurant.id, data: payload }, { onSuccess });
    } else {
      createRestaurant(payload, { onSuccess });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {hasRestaurant ? "Edit Profile" : "Setup Kitchen"}
          </Text>
          
          {!hasRestaurant && (
            <Text style={{color: colors.textLight, marginBottom: 20}}>
              Welcome! Let&apos;s get your restaurant set up so customers can find you.
            </Text>
          )}

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

            {/* 👇 SMART ADDRESS INPUT */}
            <View style={[styles.inputGroup, { zIndex: 100 }]}> 
              <Text style={[styles.label, { color: colors.text }]}>Store Address</Text>
              <View>
                <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                    value={address}
                    onChangeText={onAddressChange}
                    placeholder="Start typing your street address..."
                    placeholderTextColor={colors.textLight}
                />
                {isSearching && (
                    <ActivityIndicator style={{position:'absolute', right: 10, top: 14}} size="small" color={COLORS.primary}/>
                )}
              </View>

              {/* DROPDOWN */}
              {showSuggestions && suggestions.length > 0 && (
                <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {suggestions.map((item) => (
                        <TouchableOpacity 
                            key={item.place_id} 
                            style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                            onPress={() => selectSuggestion(item)}
                        >
                            <Ionicons name="location-outline" size={16} color={colors.textLight} style={{marginTop: 2}}/>
                            <Text style={{color: colors.text, marginLeft: 8, fontSize: 13}}>
                                {item.display_name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* LOCATION STATUS BOX */}
            <View style={[styles.locationBox, { borderColor: location ? COLORS.success : COLORS.border }]}>
                 <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons 
                      name={location ? "checkmark-circle" : "alert-circle-outline"} 
                      size={20} 
                      color={location ? COLORS.success : COLORS.textLight} 
                    />
                    <Text style={{ marginLeft: 8, color: colors.text, fontSize: 13, flex: 1 }}>
                      {location 
                        ? "Location Pinned! ✅" 
                        : "No location pinned. Select an address or use GPS."}
                    </Text>
                 </View>

                 {!location && (
                    <TouchableOpacity 
                      style={[styles.gpsBtn, { marginTop: 10, borderColor: COLORS.primary }]}
                      onPress={getCurrentLocation}
                      disabled={isLoadingGPS}
                    >
                        {isLoadingGPS ? <ActivityIndicator size="small" color={COLORS.primary}/> : (
                            <>
                              <Ionicons name="navigate" size={14} color={COLORS.primary} />
                              <Text style={{color: COLORS.primary, fontSize:12, fontWeight:'600', marginLeft:5}}>
                                I&apos;m at the shop (Use GPS)
                              </Text>
                            </>
                        )}
                    </TouchableOpacity>
                 )}
            </View>

            {/* Other Inputs */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

             <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Prep Time (Mins)</Text>
                    <TextInput
                        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                        value={prepTime}
                        onChangeText={setPrepTime}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={isPending}
            >
              {isPending ? <ActivityIndicator color="white" /> : (
                <Text style={styles.saveButtonText}>
                  {hasRestaurant ? "Save Changes" : "Go Live 🚀"}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.l },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  form: { gap: 15 },
  inputGroup: { marginBottom: 5, position: 'relative' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, opacity: 0.8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  
  // Dropdown
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    zIndex: 1000, 
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 0.5,
  },

  // Location Box
  locationBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginTop: 5
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  
  saveButton: { marginTop: 20, paddingVertical: 18, borderRadius: 12, alignItems: 'center', ...SHADOWS.medium },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});