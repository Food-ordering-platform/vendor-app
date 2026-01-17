import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInstallPrompt } from '../hooks/useInstallPrompts';
import { COLORS, SHADOWS } from '../constants/theme';

export const PWAInstallBanner = () => {
  const { isInstallable, triggerInstall } = useInstallPrompt();
  
  // Only render on Web AND if the browser says it's installable
  if (Platform.OS !== 'web' || !isInstallable) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
            <Image 
              source={require('../assets/vendor_logo.png')} 
              style={{ width: 24, height: 24, borderRadius: 4 }} 
            />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
            <Text style={styles.title}>Install Vendor App</Text>
            <Text style={styles.subtitle}>
                Add to Home Screen for quick access.
            </Text>
        </View>

        {/* Install Button */}
        <TouchableOpacity 
            style={styles.installBtn} 
            onPress={triggerInstall}
            activeOpacity={0.8}
        >
            <Text style={styles.installText}>Install</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20, // Floating at the bottom
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999, // Ensure it's on top of everything
    paddingHorizontal: 16,
    pointerEvents: 'box-none', // Let clicks pass through outside the banner
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    maxWidth: 450, // Don't stretch too wide on desktop
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 1,
  },
  installBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  installText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  }
});