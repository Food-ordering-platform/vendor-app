import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext'; // 👈 Import Hook
import { SPACING, SHADOWS } from '../constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNotification?: boolean;
  useLogo?: boolean; // 👈 New Prop for Logo
}

export default function Header({ title, subtitle, showNotification = true, useLogo = false }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme(); // 👈 Get dynamic colors

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top + SPACING.s,
        backgroundColor: colors.surface, // Dynamic Background
        borderBottomColor: colors.border
      }
    ]}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          {/* LOGO LOGIC */}
          {useLogo ? (
            <Image 
              source={require('../assets/images/icon.png')} // Replace with your logo path
              style={{ width: 35, height: 35, marginRight: 10, borderRadius: 8 }}
            />
          ) : null}

          <View>
            {subtitle && <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>{subtitle}</Text>}
            {title && <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>{title}</Text>}
          </View>
        </View>
        
        {showNotification && (
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <View style={styles.badge} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
    borderBottomWidth: 1,
    ...SHADOWS.small,
  },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#FFF' },
});