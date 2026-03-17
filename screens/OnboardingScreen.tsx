import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  useWindowDimensions, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SLIDES = [
  {
    id: '1',
    icon: 'megaphone', 
    title: 'Expand Your Reach',
    subtitle: 'Connect with thousands of hungry customers in your area instantly.',
  },
  {
    id: '2',
    icon: 'receipt',
    title: 'Manage Orders',
    subtitle: 'Track, process, and deliver orders efficiently with our tools.',
  },
  {
    id: '3',
    icon: 'wallet',
    title: 'Boost Earnings',
    subtitle: 'Grow your business with insights and fast payouts.',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width, height } = useWindowDimensions();

const skip = async () => {
    try {
      // Set the flag so they never see Onboarding again
      await AsyncStorage.setItem('alreadyLaunched', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error("Error setting onboarding flag:", error);
      navigation.replace('Login'); // Fail gracefully and proceed
    }
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < SLIDES.length) {
      const offset = nextSlideIndex * width;
      flatListRef?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      navigation.replace('Login');
    }
  };

  // 🟢 FIXED: Detect active slide immediately when 50% visible
  // This makes the swipe feel responsive because it updates BEFORE the scroll stops
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconCircle}>
        <Ionicons name={item.icon as any} size={80} color={COLORS.primary} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FDF8F9' }]}>
      <StatusBar style="dark" />
      
      <FlatList
        ref={flatListRef}
        // 🟢 UPDATED: Replaced onMomentumScrollEnd with onViewableItemsChanged
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={32}
        
        // 🟢 ADDED: getItemLayout ensures smoother snapping
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}

        contentContainerStyle={{ alignItems: 'center', paddingTop: height * 0.1 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={SLIDES}
        pagingEnabled
        bounces={false} // Prevents overscrolling on iOS
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <View style={[styles.footer, { height: height * 0.25 }]}>
        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnContainer}>
          {currentSlideIndex === SLIDES.length - 1 ? (
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.primaryBtn} 
              onPress={skip}
            >
              <Text style={styles.primaryBtnText}>GET STARTED</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                activeOpacity={0.6} 
                style={styles.skipBtn} 
                onPress={skip}
              >
                <Text style={styles.skipBtnText}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={goToNextSlide} 
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'flex-start' },
  
  iconCircle: {
    height: 180,
    width: 180,
    borderRadius: 90,
    backgroundColor: '#FFEBF0', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    ...SHADOWS.medium, 
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
  },
  
  textContainer: { paddingHorizontal: 40, alignItems: 'center' },
  
  title: { 
    color: '#2D1B21', 
    fontSize: 32, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 16,
    letterSpacing: -0.5
  },
  subtitle: { 
    color: '#6B7280', 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 24,
    fontWeight: '500'
  },
  
  footer: { justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40 },
  
  indicatorContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  indicator: { height: 6, width: 6, backgroundColor: '#E5E7EB', marginHorizontal: 4, borderRadius: 3 },
  indicatorActive: { backgroundColor: COLORS.primary, width: 24, height: 6, borderRadius: 3 },
  
  btnContainer: { marginBottom: 10 },
  
  primaryBtn: {
    height: 56,
    borderRadius: 30, 
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    shadowColor: COLORS.primary, 
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: { fontWeight: 'bold', fontSize: 16, color: '#fff', letterSpacing: 1 },
  
  skipBtn: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skipBtnText: { color: COLORS.textLight, fontSize: 16, fontWeight: '600' },
  
  nextBtn: {
    height: 56,
    width: 140,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  nextBtnText: { fontWeight: 'bold', fontSize: 16, color: '#fff' },
});