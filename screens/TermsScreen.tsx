import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

export default function TermsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Agreement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toDateString()}</Text>

        <Text style={styles.intro}>
          This Merchant Partner Agreement &quot;Agreement&quot; is a binding legal contract between 
          <Text style={{fontWeight: 'bold'}}> You </Text> &quot;Vendor&quot; and 
          <Text style={{fontWeight: 'bold'}}> ChowEazy </Text> (NatureNest Global Company).
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Commission & Fees</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bullet}>• </Text>
            <Text style={{fontWeight: 'bold'}}>20% Commission: </Text>
            ChowEazy charges a commission of 20% on the Gross Order Value of every order placed through the Platform.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bullet}>• </Text>
            <Text style={{fontWeight: 'bold'}}>Payouts: </Text>
            Net earnings (Order Value minus Commission) will be remitted to your designated bank account on a weekly basis (every Tuesday).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Food Safety & Indemnity</Text>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color={COLORS.primary} style={{marginBottom: 5}}/>
            <Text style={styles.warningText}>
              You are solely responsible for the quality, safety, and hygiene of the food. 
              You agree to indemnify ChowEazy against any claims, lawsuits, or damages arising from 
              food poisoning, allergic reactions, or foreign objects found in your food.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Service Level Agreement (SLA)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bullet}>• </Text>
            <Text style={{fontWeight: 'bold'}}>Prep Time: </Text>
            You agree to prepare orders within the time specified in the App. Frequent delays (10 mins) may result in temporary suspension.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bullet}>• </Text>
            <Text style={{fontWeight: 'bold'}}>Cancellations: </Text>
            You may not cancel orders once accepted unless due to Force Majeure. Excessive cancellations will incur penalties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            You grant ChowEazy a non-exclusive license to use your restaurant name, logo, and food images for marketing purposes on the App and social media.
          </Text>
        </View>

        {/* Footer Space */}
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  lastUpdated: { fontSize: 12, color: '#6B7280', marginBottom: 20, textAlign: 'center' },
  intro: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 25 },
  section: { marginBottom: 25, backgroundColor: 'white', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  paragraph: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 10 },
  bullet: { fontWeight: 'bold', color: COLORS.primary },
  warningBox: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  warningText: { color: '#7F1D1D', fontSize: 13, lineHeight: 20 },
});