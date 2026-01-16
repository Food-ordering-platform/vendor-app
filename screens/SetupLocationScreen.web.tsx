import React, { useState, useEffect, useRef, createElement } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

// Helper to access the global Google object
declare global {
  interface Window {
    google: any;
  }
}

export default function SetupLocationScreen({ navigation }: any) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); 
  const googleMapRef = useRef<any>(null);
  
  const [address, setAddress] = useState<string>("Locating...");
  const [loading, setLoading] = useState(false);
  // Default to Lagos, but will update
  const [center, setCenter] = useState({ lat: 6.5244, lng: 3.3792 }); 

  // 1. Initialize Map & Autocomplete
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && mapRef.current) {
        clearInterval(interval);
        initMap();
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const initMap = () => {
    if (!window.google || !mapRef.current) return;

    // A. Create Map
    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 15,
      disableDefaultUI: true, 
      clickableIcons: false,
    });
    googleMapRef.current = map;

    // B. Setup Search Autocomplete
    if (inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["geometry", "formatted_address", "name"],
      });
      
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          return;
        }

        // Move Map
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        // Update State
        const newAddress = place.formatted_address || place.name;
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();

        setAddress(newAddress);
        setCenter({ lat: newLat, lng: newLng });
        
        // Force update input value visually
        if(inputRef.current) inputRef.current.value = newAddress;
      });
    }

    // C. Listen for Drag End (Idle)
    map.addListener("idle", () => {
      const newCenter = map.getCenter();
      const lat = newCenter.lat();
      const lng = newCenter.lng();
      setCenter({ lat, lng });
      fetchAddress(lat, lng);
    });

    // D. Get Current Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };
          map.setCenter(userLoc);
        },
        () => console.log("Geolocation blocked")
      );
    }
  };

  const fetchAddress = (lat: number, lng: number) => {
    // Only fetch if we are NOT currently using the search bar to avoid overwriting
    if (document.activeElement === inputRef.current) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
        if(inputRef.current) {
           inputRef.current.value = results[0].formatted_address;
        }
      }
    });
  };

  const handleConfirm = () => {
    // 🟢 ROBUST NAVIGATION FIX
    // This ensures we find 'Profile' whether it's a sibling or nested in Main
    navigation.navigate('Profile', { 
      selectedAddress: address,
      selectedLat: center.lat,
      selectedLng: center.lng,
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      
      {/* 🗺️ MAP */}
      <View style={styles.mapContainer}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </View>

      {/* 🔍 SEARCH BAR */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBoxWrapper}>
            <Ionicons name="search" size={20} color={COLORS.textLight} style={{marginLeft: 10}}/>
            {createElement('input', {
                ref: inputRef,
                style: {
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    marginLeft: '10px',
                    height: '100%',
                    backgroundColor: 'transparent',
                    color: COLORS.text,
                    width: '100%' // Ensure full width
                },
                placeholder: "Search for your location...",
                type: "text"
            })}
        </View>
      </View>

      {/* 📍 CENTER PIN */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View style={styles.pinWrapper}>
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
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleConfirm}
            disabled={loading} // 🟢 REMOVED isDragging CHECK
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
  searchBoxWrapper: {
    flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', 
    ...SHADOWS.small,
    overflow: 'hidden'
  },

  pinContainer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 0,
  },
  pinWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
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