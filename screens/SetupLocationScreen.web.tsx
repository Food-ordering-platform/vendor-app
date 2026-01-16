import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

// Helper to access the global Google object we loaded in index.html
declare global {
  interface Window {
    google: any;
  }
}

export default function SetupLocationScreen({ navigation }: any) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  
  const [address, setAddress] = useState<string>("Locating...");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState({ lat: 6.5244, lng: 3.3792 }); // Default Lagos

  // 1. Initialize Map
  useEffect(() => {
    if (mapRef.current && !googleMapRef.current) {
      // Create the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 15,
        disableDefaultUI: true, // Clean look like native
        clickableIcons: false,
      });

      googleMapRef.current = map;

      // Listen for drags
      map.addListener("dragstart", () => setIsDragging(true));
      map.addListener("idle", () => {
        setIsDragging(false);
        const newCenter = map.getCenter();
        const lat = newCenter.lat();
        const lng = newCenter.lng();
        setCenter({ lat, lng });
        fetchAddress(lat, lng);
      });

      // Try to get real User Location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userLoc = { lat: latitude, lng: longitude };
            map.setCenter(userLoc);
            setCenter(userLoc);
            fetchAddress(latitude, longitude);
          },
          () => console.log("Geolocation blocked")
        );
      }
    }
  }, []);

  // 2. Reverse Geocoding (Web Version)
  const fetchAddress = (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Unknown Location");
      }
    });
  };

  const handleConfirm = () => {
    navigation.navigate({
      name: 'Profile',
      params: { 
        selectedAddress: address,
        selectedLat: center.lat,
        selectedLng: center.lng
      },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      
      {/* 🗺️ WEB MAP CONTAINER */}
      <View style={styles.mapContainer}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </View>

      {/* 🔙 HEADER / SEARCH */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={COLORS.textLight} />
            <Text style={{ color: COLORS.textLight, marginLeft: 8 }}>Drag map to adjust</Text>
        </View>
      </View>

      {/* 📍 STATIC CENTER PIN */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View style={[styles.pinWrapper, isDragging && styles.pinDragging]}>
            <Ionicons name="location" size={40} color={COLORS.primary} />
            <View style={styles.shadow} />
        </View>
      </View>

      {/* 🎯 RE-CENTER BUTTON */}
      <TouchableOpacity 
        style={styles.gpsButton}
        onPress={() => {
             if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    googleMapRef.current?.panTo({ lat: latitude, lng: longitude });
                });
             }
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
  mapContainer: { width: '100%', height: '100%', position: 'absolute' },
  
  headerContainer: {
    position: 'absolute', top: 20, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', zIndex: 10
  },
  backButton: {
    width: 44, height: 44, backgroundColor: 'white', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.small,
    marginRight: 10
  },
  searchBox: {
    flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
    ...SHADOWS.small
  },

  pinContainer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 0,
  },
  pinWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  pinDragging: { transform: [{ scale: 1.1 }, { translateY: -10 }] },
  shadow: { width: 10, height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5, marginTop: -2 },

  gpsButton: {
    position: 'absolute', bottom: 240, right: 20,
    width: 50, height: 50, backgroundColor: 'white', borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium, zIndex: 10
  },
  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.l, paddingBottom: 40, ...SHADOWS.medium,
    zIndex: 20
  },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, marginBottom: SPACING.s },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l, backgroundColor: COLORS.background, padding: 12, borderRadius: 12 },
  addressText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '600' },
  button: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  buttonDisabled: { backgroundColor: COLORS.textLight },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});