import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Platform,
  Dimensions,
  Keyboard
} from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

// Get API Key from environment
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY;

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005; 
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function SetupLocationScreen({ navigation, route }: any) {
  const mapRef = useRef<MapView>(null);
  
  // FIX: Extract the flag passed from ProfileScreen
  const { returnToMain } = route.params || {};

  // Default to Lagos
  const [region, setRegion] = useState<Region>({
    latitude: 6.5244, 
    longitude: 3.3792,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [address, setAddress] = useState<string>("Locating...");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Get User Location on Mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Just fail silently or default to Lagos if denied
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      fetchAddress(latitude, longitude);
    })();
  }, []);

  // 2. Fetch Address from Google
  const fetchAddress = async (lat: number, lng: number) => {
    if (!GOOGLE_API_KEY) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Unknown Location");
      }
    } catch (error) {
      console.log("Geocoding Error:", error);
    }
  };

  // 3. Map Handlers
  const onRegionChange = () => {
    if (!isDragging) setIsDragging(true);
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setIsDragging(false);
    setRegion(newRegion);
    fetchAddress(newRegion.latitude, newRegion.longitude);
  };

  // 4. Confirm & Go Back
  const handleConfirm = () => {
    const locationParams = {
        selectedAddress: address,
        selectedLat: region.latitude,
        selectedLng: region.longitude
    };

    // 👇 FIX: Conditional Navigation based on where we came from
    if (returnToMain) {
        // We are in Dashboard Mode -> Profile is nested in 'Main'
        navigation.navigate('Main', {
            screen: 'Profile',
            params: locationParams,
            merge: true,
        });
    } else {
        // We are in Onboarding Mode -> Profile is a top-level Stack screen
        navigation.navigate({
            name: 'Profile',
            params: locationParams,
            merge: true,
        });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 🗺️ MAP */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE} 
        initialRegion={region}
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false} 
        onPanDrag={() => Keyboard.dismiss()} 
      />

      {/* 🔍 SEARCH BAR (Overlay) */}
      <SafeAreaView style={styles.searchContainer} pointerEvents="box-none">
        <View style={styles.searchRow}>
            {/* Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            {/* Google Places Input */}
            <View style={styles.searchInputContainer}>
                <GooglePlacesAutocomplete
                    placeholder="Search street, area..."
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        const point = details?.geometry?.location;
                        if (point) {
                            const newRegion = {
                                latitude: point.lat,
                                longitude: point.lng,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA,
                            };
                            setRegion(newRegion);
                            mapRef.current?.animateToRegion(newRegion, 1000);
                            setAddress(data.description);
                            Keyboard.dismiss();
                        }
                    }}
                    query={{
                        key: GOOGLE_API_KEY,
                        language: 'en',
                        components: 'country:ng',
                    }}
                    styles={{
                        textInput: styles.searchInput,
                        listView: styles.searchResultsList,
                        container: { flex: 1 },
                    }}
                    enablePoweredByContainer={false} 
                    debounce={300}
                />
            </View>
        </View>
      </SafeAreaView>

      {/* 📍 CENTER PIN */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View style={[styles.pinWrapper, isDragging && styles.pinDragging]}>
            <Ionicons name="location" size={40} color={COLORS.primary} />
            <View style={styles.shadow} />
        </View>
      </View>

      {/* 🎯 RE-CENTER BUTTON */}
      <TouchableOpacity 
        style={styles.gpsButton}
        onPress={async () => {
            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            mapRef.current?.animateToRegion({
                latitude, longitude, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA
            });
        }}
      >
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* 📝 BOTTOM CARD */}
      <View style={styles.bottomCard}>
        <Text style={styles.label}>CONFIRM DELIVERY ADDRESS</Text>
        
        <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
            <Text style={styles.addressText} numberOfLines={2}>
                {address}
            </Text>
        </View>

        <TouchableOpacity 
            style={[styles.button, (loading || isDragging) && styles.buttonDisabled]} 
            onPress={handleConfirm}
            disabled={loading || isDragging}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.buttonText}>Confirm Location</Text>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  
  // Search Bar Styling
  searchContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.m,
    paddingTop: 10,
    gap: 10,
  },
  backButton: {
    width: 44, height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.small,
    marginTop: 2, 
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 15,
    ...SHADOWS.small,
    color: COLORS.text,
  },
  searchResultsList: {
    backgroundColor: 'white',
    marginTop: 8,
    borderRadius: 12,
    ...SHADOWS.medium,
  },

  // Pin
  pinContainer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  pinWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  pinDragging: { transform: [{ scale: 1.1 }, { translateY: -10 }] },
  shadow: { width: 10, height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5, marginTop: -2 },

  // Controls
  gpsButton: {
    position: 'absolute', bottom: 240, right: 20,
    width: 50, height: 50, backgroundColor: 'white', borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium,
  },
  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.l, paddingBottom: 40, ...SHADOWS.medium,
  },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, marginBottom: SPACING.s },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l, backgroundColor: COLORS.background, padding: 12, borderRadius: 12 },
  addressText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '600' },
  button: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  buttonDisabled: { backgroundColor: COLORS.textLight },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});