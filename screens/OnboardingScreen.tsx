import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  useWindowDimensions, 
  TouchableOpacity, 
  Image,
  SafeAreaView
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

const SLIDES = [
  {
    id: '1',
    title: 'Expand Your Reach',
    subtitle: 'Connect with thousands of hungry customers in your area instantly.',
  },
  {
    id: '2',
    title: 'Manage Orders Easily',
    subtitle: 'Track, process, and deliver orders efficiently with our tools.',
  },
  {
    id: '3',
    title: 'Boost Your Earnings',
    subtitle: 'Grow your business with insights and fast payouts.',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width, height } = useWindowDimensions();

  const skip = () => {
    navigation.replace('Login');
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    
    if (nextSlideIndex < SLIDES.length) {
      const offset = nextSlideIndex * width;
      flatListRef?.current?.scrollToOffset({ offset });
      // 👇 FIX: Manually update state immediately (don't wait for scroll event)
      setCurrentSlideIndex(nextSlideIndex); 
    } else {
      navigation.replace('Login');
    }
  };

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { width, paddingTop: height * 0.1 }]}>
      <Image 
        source={item.image} 
        style={[styles.image, { height: height * 0.4, width: width * 0.8 }]} 
        resizeMode="contain" 
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        contentContainerStyle={{ height: height * 0.75 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={SLIDES}
        pagingEnabled
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        // 👇 ADDED: Prevents scroll interference on web
        scrollEventThrottle={32}
      />

      <View style={[styles.footer, { height: height * 0.25 }]}>
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
            <TouchableOpacity style={styles.btn} onPress={skip}>
              <Text style={styles.btnText}>GET STARTED</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary }]} 
                onPress={skip}
              >
                <Text style={[styles.btnText, { color: COLORS.primary }]}>SKIP</Text>
              </TouchableOpacity>
              <View style={{ width: 15 }} />
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={goToNextSlide} 
                style={styles.btn}
              >
                <Text style={styles.btnText}>NEXT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    alignItems: 'center',
  },
  image: {
    // Dynamic dimensions handled inline
  },
  textContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  footer: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 4,
    width: 10,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  indicatorActive: {
    backgroundColor: COLORS.primary,
    width: 25,
  },
  btnContainer: {
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#fff',
  },
});