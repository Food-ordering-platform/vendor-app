import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function PrivacyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Your privacy matters. This policy explains how ChowEazy collects and uses Vendor data.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>We collect:</Text>
          <Text style={styles.listItem}>• Business Name, Address, and Contact Details.</Text>
          <Text style={styles.listItem}>• Bank Account Information (for payouts).</Text>
          <Text style={styles.listItem}>• Transaction history and Order data.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Data</Text>
          <Text style={styles.paragraph}>
            We use your data to facilitate orders, process payments, and improve our logistics algorithms. 
            We do not sell your data to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Sharing</Text>
          <Text style={styles.paragraph}>
            We share necessary details (Restaurant Name, Pickup Address) with Riders to fulfill deliveries.
          </Text>
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  content: { padding: 20 },
  intro: { fontSize: 15, color: '#4B5563', marginBottom: 30, lineHeight: 24 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  paragraph: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 5 },
  listItem: { fontSize: 14, color: '#6B7280', lineHeight: 24, paddingLeft: 10 },
});