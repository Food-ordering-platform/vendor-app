import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  useWindowDimensions, 
  TouchableOpacity, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

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
  
  const { width: windowWidth } = useWindowDimensions();
  // 🟢 FIX 1: Match Slide Width to Container Max Width (480px)
  const slideWidth = windowWidth > 480 ? 480 : windowWidth; 

  const skip = () => {
    navigation.replace('Login');
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < SLIDES.length) {
      const offset = nextSlideIndex * slideWidth;
      flatListRef?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      navigation.replace('Login');
    }
  };

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / slideWidth);
    setCurrentSlideIndex(currentIndex);
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    // 🟢 FIX 2: Add height: '100%' so flex centering works
    <View style={[styles.slide, { width: slideWidth, height: '100%' }]}>
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
    <View style={styles.webBackground}>
        <View style={styles.mobileContainer}>
            <FlatList
                ref={flatListRef}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                // 🟢 FIX 3: Flex 1 to fill available space
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={SLIDES}
                pagingEnabled
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEventThrottle={32}
            />

            <View style={styles.footer}>
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

                <View style={styles.btnContainer}>
                {currentSlideIndex === SLIDES.length - 1 ? (
                    <TouchableOpacity style={styles.primaryBtn} onPress={skip}>
                        <Text style={styles.primaryBtnText}>GET STARTED</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity 
                        style={styles.skipBtn} 
                        onPress={skip}
                    >
                        <Text style={styles.skipBtnText}>Skip</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={goToNextSlide} 
                        style={styles.nextBtn}
                    >
                        <Text style={styles.nextBtnText}>Next</Text>
                        <Ionicons name="arrow-forward" size={18} color="white" />
                    </TouchableOpacity>
                    </View>
                )}
                </View>
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackground: {
    flex: 1,
    backgroundColor: '#EAECEF', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 480, // Matches the slide logic now
    height: '100%', 
    maxHeight: 850, 
    backgroundColor: '#FDF8F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    overflow: 'hidden',
    position: 'relative'
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center', // This now works because height is 100%
    paddingBottom: 100, // Make room for footer so content is visually centered
  },
  iconCircle: {
    height: 160,
    width: 160,
    borderRadius: 80,
    backgroundColor: '#FFEBF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  textContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    color: '#2D1B21',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 30,
    backgroundColor: 'transparent'
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicator: { height: 6, width: 6, backgroundColor: '#E5E7EB', marginHorizontal: 4, borderRadius: 3 },
  indicatorActive: { backgroundColor: COLORS.primary, width: 20, height: 6, borderRadius: 3 },
  
  btnContainer: { marginBottom: 10 },
  
  primaryBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(123, 30, 58, 0.4)', 
  },
  primaryBtnText: { fontWeight: 'bold', fontSize: 15, color: '#fff', letterSpacing: 1 },
  
  skipBtn: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  skipBtnText: { color: COLORS.textLight, fontSize: 15, fontWeight: '600' },
  
  nextBtn: {
    height: 50,
    width: 120,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
  },
  nextBtnText: { fontWeight: 'bold', fontSize: 15, color: '#fff' },
});