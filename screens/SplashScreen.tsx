import React, { useEffect } from 'react';
import { View, Image,  StyleSheet, Animated, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme'; 

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const textFade = new Animated.Value(0);
  const textSlide = new Animated.Value(20);

  useEffect(() => {
    // Animation Sequence
    Animated.sequence([
      // 1. Logo Enters
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Text Slides Up
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Navigate after delay
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <View style={styles.logoMask}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="cover" 
            />
          </View>
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 15, 
  },
  logoMask: {
    width: 140,
    height: 140,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    overflow: 'hidden', 
    elevation: 15, // Higher shadow for pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)', // Subtle rim light
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandText: {
    fontSize: 48, // Bigger
    color: 'white',
    // ✅ The "Interesting" Font Stack
    // iOS: Baskerville is elegant and classic.
    // Android: Serif is the closest system equivalent.
    fontFamily: Platform.OS === 'ios' ? 'Baskerville-BoldItalic' : 'serif',
    fontStyle: 'italic', 
    fontWeight: Platform.OS === 'android' ? 'bold' : 'normal',
    
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 4, // Spaced out for a modern look
    fontWeight: '600',
    marginTop: -5, // Tuck it closer to the main text
  }
});