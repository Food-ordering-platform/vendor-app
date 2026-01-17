import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Modal,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInstallPrompt } from '../hooks/useInstallPrompts';
import { COLORS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 500; // Constrain width on tablets/desktop

export const PWAInstallBanner = () => {
  const { isInstallable, triggerInstall } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Only run on Web
    if (Platform.OS !== 'web') return;

    // 1. Check if already installed
    const nav = window.navigator as any;
    const isApp = window.matchMedia('(display-mode: standalone)').matches || (nav.standalone === true);
    setIsStandalone(isApp);
    if (isApp) return;

    // 2. Check Device Type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = 
      userAgent.includes('iphone') || 
      userAgent.includes('ipad') || 
      userAgent.includes('ipod');
    setIsIOS(isIosDevice);

    // 3. AUTO-OPEN LOGIC (Like Frontend)
    // If it's iOS, we know we can show instructions immediately.
    // If it's Android/Desktop, we wait for 'isInstallable' to become true from the hook.
    if (isIosDevice) {
       setTimeout(() => setIsVisible(true), 3000);
    }

  }, []);

  // 4. Watch for Android/Desktop "Ready" state
  useEffect(() => {
    if (isInstallable && !isStandalone) {
      setTimeout(() => setIsVisible(true), 3000);
    }
  }, [isInstallable, isStandalone]);


  if (!isVisible) return null;

  const handleInstall = async () => {
    if (!isIOS) {
       await triggerInstall();
       setIsVisible(false);
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          
          {/* DRAG HANDLE (Visual only) */}
          <View style={styles.dragHandle} />

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Install Vendor App</Text>
            <Text style={styles.description}>
              {isIOS 
                ? "Install our app for a better experience and faster access." 
                : "Add ChowEazy Vendor to your home screen for quick access."}
            </Text>
          </View>

          {/* CONTENT */}
          <View style={styles.content}>
            {isIOS ? (
              /* iOS Instructions */
              <View style={styles.iosSteps}>
                 <View style={styles.stepRow}>
                    <View style={styles.stepIcon}>
                      <Ionicons name="share-outline" size={22} color="#3B82F6" />
                    </View>
                    <View>
                      <Text style={styles.stepTitle}>1. Tap the Share button</Text>
                      <Text style={styles.stepDesc}>Look for the share icon in your browser bar.</Text>
                    </View>
                 </View>
                 <View style={styles.stepRow}>
                    <View style={styles.stepIcon}>
                      <Ionicons name="add-circle-outline" size={22} color="#000" />
                    </View>
                    <View>
                      <Text style={styles.stepTitle}>2. Select &quot;Add to Home Screen&quot;</Text>
                      <Text style={styles.stepDesc}>Scroll down or swipe left to find it.</Text>
                    </View>
                 </View>
              </View>
            ) : (
              /* Android/Desktop Action */
              <View style={styles.androidAction}>
                 <View style={styles.appIconContainer}>
                    <Image 
                      source={require('../assets/vendor_logo.png')} 
                      style={styles.appIcon} 
                    />
                 </View>
                 <TouchableOpacity 
                    style={styles.primaryBtn}
                    onPress={handleInstall}
                 >
                    <Text style={styles.primaryBtnText}>Install App Now</Text>
                 </TouchableOpacity>
                 <Text style={styles.tinyText}>No download required. Uses almost no storage.</Text>
              </View>
            )}
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.secondaryBtn} 
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.secondaryBtnText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center', // Centers the sheet on wide screens (tablets)
  },
  sheet: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: MAX_WIDTH, // Tablet support
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...SHADOWS.medium,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    marginBottom: 24,
  },
  // iOS Styles
  iosSteps: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  stepDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Android Styles
  androidAction: {
    alignItems: 'center',
    gap: 16,
  },
  appIconContainer: {
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  tinyText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Buttons
  primaryBtn: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.primary, // Green or Brand Color
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 0,
  },
  secondaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
});