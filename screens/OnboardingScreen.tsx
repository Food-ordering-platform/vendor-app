import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Animated, TouchableOpacity, 
  Dimensions, SafeAreaView, Platform 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/themeContext'; // Dynamic Theme
import { SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', title: 'Manage Your Menu', description: 'Easily add new dishes, update prices, and control availability instantly.', icon: 'restaurant' },
  { id: '2', title: 'Live Order Command', description: 'Receive real-time order alerts. Accept, cook, and dispatch riders with one tap.', icon: 'notifications' },
  { id: '3', title: 'Track Your Growth', description: 'Monitor your daily earnings and withdraw your funds whenever you need.', icon: 'wallet' },
];

export default function OnboardingScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const Paginator = ({ data, scrollX }: any) => {
    return (
      <View style={{ flexDirection: 'row', height: 64 }}>
        {data.map((_: any, i: number) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange, outputRange: [10, 20, 10], extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp',
          });
          return <Animated.View style={[styles.dot, { width: dotWidth, opacity, backgroundColor: colors.primary }]} key={i.toString()} />;
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Spacer for top area since Skip is gone */}
      <View style={{ height: 20 }} />

      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.iconContainer}>
                <View style={[styles.circleBackground, { backgroundColor: isDark ? '#374151' : '#FFE4E6' }]}>
                  <Ionicons name={item.icon as any} size={100} color={colors.primary} />
                </View>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.primary }]}>{item.title}</Text>
                <Text style={[styles.description, { color: colors.textLight }]}>{item.description}</Text>
              </View>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          onViewableItemsChanged={viewableItemsChanged}
          viewConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        <Paginator data={SLIDES} scrollX={scrollX} />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleNext}>
          <Text style={styles.buttonText}>{currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
          {currentIndex !== SLIDES.length - 1 && <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  slide: { width: width, alignItems: 'center', paddingHorizontal: SPACING.l },
  // Fixed Layout to prevent cutting
  iconContainer: { 
    flex: 0.65, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%', 
    paddingTop: 20 
  },
  circleBackground: {
    width: width * 0.75, 
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { flex: 0.35, alignItems: 'center', justifyContent: 'flex-start', paddingTop: SPACING.m },
  title: { fontSize: 28, fontWeight: '800', marginBottom: SPACING.m, textAlign: 'center' },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: SPACING.m },
  footer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.l, paddingBottom: SPACING.xl * 1.5 },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 8 },
  button: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, alignItems: 'center', justifyContent: 'center', width: '80%', elevation: 5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});