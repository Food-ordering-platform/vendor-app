import React, { useState, useEffect, useRef, createElement } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import { useAuth } from '../context/authContext';

declare global {
  interface Window {
    google: any;
  }
}

export default function SetupLocationScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); 
  const googleMapRef = useRef<any>(null);
  
  const draftData = route.params?.draftData || {};

  const [address, setAddress] = useState<string>("Locating...");
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [center, setCenter] = useState({ lat: 6.5244, lng: 3.3792 }); 

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
    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 15,
      disableDefaultUI: true, 
      clickableIcons: false,
    });
    googleMapRef.current = map;

    if (inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["geometry", "formatted_address", "name"],
      });
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        const newAddress = place.formatted_address || place.name;
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();

        setAddress(newAddress);
        setCenter({ lat: newLat, lng: newLng });
        if(inputRef.current) inputRef.current.value = newAddress;
      });
    }

    map.addListener("idle", () => {
      const newCenter = map.getCenter();
      setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      fetchAddress(newCenter.lat(), newCenter.lng());
    });
  };

  const fetchAddress = (lat: number, lng: number) => {
    if (document.activeElement === inputRef.current) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
        if(inputRef.current) inputRef.current.value = results[0].formatted_address;
      }
    });
  };

  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (googleMapRef.current) {
            const userLoc = { lat: latitude, lng: longitude };
            googleMapRef.current.panTo(userLoc);
            googleMapRef.current.setZoom(17);
            setCenter(userLoc);
            fetchAddress(latitude, longitude);
          }
          setIsLocating(false);
        },
        (error) => {
           console.log("GPS Error", error);
           setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Profile', { draftData });
    }
  };

  const handleConfirm = () => {
    const params = { 
        selectedAddress: address,
        selectedLat: center.lat,
        selectedLng: center.lng,
        draftData: draftData, 
        merge: true,
    };

    if (user?.restaurant) {
        navigation.navigate('Main', {
            screen: 'Profile',
            params: params
        });
    } else {
        navigation.navigate('Profile', params);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </View>

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBoxWrapper}>
            <Ionicons name="search" size={20} color={COLORS.textLight} style={{marginLeft: 10}}/>
            {createElement('input', {
                ref: inputRef,
                style: {
                    flex: 1, border: 'none', outline: 'none', fontSize: '15px', marginLeft: '10px', height: '100%', backgroundColor: 'transparent', color: COLORS.text, width: '100%'
                },
                placeholder: "Search location...",
            })}
        </View>
      </View>

      <View style={styles.pinContainer} pointerEvents="none">
        <View style={styles.pinWrapper}>
            <Ionicons name="location" size={40} color={COLORS.primary} />
            <View style={styles.shadow} />
        </View>
      </View>

      <TouchableOpacity style={styles.gpsButton} onPress={handleCurrentLocation} disabled={isLocating}>
        {isLocating ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="locate" size={24} color={COLORS.primary} />}
      </TouchableOpacity>

      <View style={styles.bottomCard}>
        <Text style={styles.label}>CONFIRM DELIVERY ADDRESS</Text>
        <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
            <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleConfirm} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapContainer: { width: '100%', height: '100%', position: 'absolute', zIndex: 0 },
  headerContainer: { position: 'absolute', top: Platform.OS === 'web' ? 30 : 20, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', zIndex: 1000 },
  backButton: { width: 44, height: 44, backgroundColor: 'white', borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small, marginRight: 10, cursor: 'pointer' },
  searchBoxWrapper: { flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22, flexDirection: 'row', alignItems: 'center', ...SHADOWS.small, overflow: 'hidden' },
  pinContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: 500 },
  pinWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  shadow: { width: 10, height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5, marginTop: -2 },
  gpsButton: { position: 'absolute', bottom: 240, right: 20, width: 50, height: 50, backgroundColor: 'white', borderRadius: 25, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium, zIndex: 1000, cursor: 'pointer' },
  bottomCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.l, paddingBottom: 40, ...SHADOWS.medium, zIndex: 1000 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, marginBottom: SPACING.s },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l, backgroundColor: COLORS.background, padding: 12, borderRadius: 12 },
  addressText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '600' },
  button: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small, cursor: 'pointer' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});