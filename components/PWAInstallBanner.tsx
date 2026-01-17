import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Image, 
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInstallPrompt } from '../hooks/useInstallPrompts';
import { COLORS, SHADOWS } from '../constants/theme';

export const PWAInstallBanner = () => {
  const { isInstallable, triggerInstall } = useInstallPrompt();
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Only run on Web
    if (Platform.OS !== 'web') return;

    // 1. Check if already installed (Standalone mode)
    const nav = window.navigator as any;
    const isApp = window.matchMedia('(display-mode: standalone)').matches || (nav.standalone === true);
    setIsStandalone(isApp);

    // 2. Check if device is iOS (Using simple string checks to avoid Regex errors)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = 
      userAgent.includes('iphone') || 
      userAgent.includes('ipad') || 
      userAgent.includes('ipod');
      
    setIsIOS(isIosDevice);

  }, []);

  // --- RENDERING CONDITIONS ---
  
  // 1. If not on web, hide.
  if (Platform.OS !== 'web') return null;
  
  // 2. If already installed, hide.
  if (isStandalone) return null;
  
  // 3. If neither "Installable (Android/Desktop)" NOR "iOS", hide.
  if (!isInstallable && !isIOS) return null;

  const handleInstallPress = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      triggerInstall();
    }
  };

  return (
    <>
      {/* 🟢 THE FLOATING BANNER */}
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity 
             onPress={() => setShowIOSModal(false)} 
             style={styles.closeBtn}
          >
              <Ionicons name="close" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
              <Image 
                source={require('../assets/vendor_logo.png')} 
                style={{ width: 32, height: 32, borderRadius: 6 }} 
              />
          </View>

          {/* Text */}
          <View style={styles.textContainer}>
              <Text style={styles.title}>Install ChowEazy Vendor</Text>
              <Text style={styles.subtitle}>
                  {isIOS ? "Tap to install for better performance" : "Add to Home Screen for quick access"}
              </Text>
          </View>

          {/* Install Button */}
          <TouchableOpacity 
              style={styles.installBtn} 
              onPress={handleInstallPress}
              activeOpacity={0.8}
          >
              <Text style={styles.installText}>Install</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🍎 iOS INSTRUCTIONS MODAL */}
      <Modal
        visible={showIOSModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIOSModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Install for iOS</Text>
                <TouchableOpacity onPress={() => setShowIOSModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#E5E7EB" />
                </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              To install the Vendor App on your iPhone/iPad, simply follow these steps:
            </Text>

            {/* Step 1 */}
            <View style={styles.stepContainer}>
                <View style={styles.stepIcon}>
                   <Ionicons name="share-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.stepTextData}>
                    <Text style={styles.stepTitle}>1. Tap the Share button</Text>
                    <Text style={styles.stepDesc}>Look for the share icon in your browser&apos;s bottom bar.</Text>
                </View>
            </View>

            {/* Step 2 */}
            <View style={[styles.stepContainer, { borderBottomWidth: 0 }]}>
                <View style={styles.stepIcon}>
                   <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.stepTextData}>
                    <Text style={styles.stepTitle}>2. Select &quot;Add to Home Screen&quot;</Text>
                    <Text style={styles.stepDesc}>Scroll down or swipe left to find this option.</Text>
                </View>
            </View>

            <TouchableOpacity 
              style={styles.gotItBtn} 
              onPress={() => setShowIOSModal(false)}
            >
              <Text style={styles.gotItText}>Got it!</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20, 
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999, 
    paddingHorizontal: 16,
    pointerEvents: 'box-none', 
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    width: '100%',
    maxWidth: 450, 
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 10,
    elevation: 2
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FDF2F4', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  installBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    ...SHADOWS.small
  },
  installText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 24,
    lineHeight: 22,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 20,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF2F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepTextData: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  gotItBtn: {
    backgroundColor: '#F3F4F6',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  gotItText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  }
});