// components/ui/Toast/index.web.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme'; // Adjust path to your theme

// --- 1. The Event Emitter (Simple Logic) ---
let toastListeners: ((type: 'success' | 'error', message: string) => void)[] = [];

function emit(type: 'success' | 'error', message: string) {
  toastListeners.forEach(l => l(type, message));
}

// --- 2. The 'toast' Object (Mimics Sonner API) ---
export const toast = {
  success: (message: string) => emit('success', message),
  error: (message: string) => emit('error', message),
};

// --- 3. The 'Toaster' Component ---
export const Toaster = () => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const listener = (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      // Auto hide after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.toast, 
          { 
            backgroundColor: isSuccess ? '#F0FDF4' : '#FEF2F2',
            borderColor: isSuccess ? '#22C55E' : '#EF4444',
          }
        ]}
        onPress={() => setNotification(null)}
      >
        <View style={[styles.icon, { backgroundColor: isSuccess ? '#22C55E' : '#EF4444' }]} />
        <Text style={[styles.text, { color: isSuccess ? '#15803D' : '#B91C1C' }]}>
          {notification.message}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999, // Ensure it's on top of everything (Maps, etc)
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
    maxWidth: '90%',
  },
  icon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  }
});