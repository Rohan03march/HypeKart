import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SECTIONS = [
    {
        title: 'Privacy',
        items: [
            { icon: 'eye-outline', label: 'Data Usage', sub: 'How we use your data' },
            { icon: 'share-social-outline', label: 'Third-Party Sharing', sub: 'We never sell your data' },
            { icon: 'location-outline', label: 'Location Data', sub: 'Used only for delivery' },
        ],
    },
    {
        title: 'Security',
        items: [
            { icon: 'lock-closed-outline', label: 'Password & Authentication', sub: 'Managed securely via Clerk' },
            { icon: 'phone-portrait-outline', label: 'Active Sessions', sub: 'Your current signed-in devices' },
            { icon: 'shield-checkmark-outline', label: 'Two-Factor Authentication', sub: 'Enabled via Clerk dashboard' },
        ],
    },
    {
        title: 'Legal',
        items: [
            { icon: 'document-text-outline', label: 'Terms of Service', sub: 'Read our terms' },
            { icon: 'document-lock-outline', label: 'Privacy Policy', sub: 'Read our policy' },
        ],
    },
];

export default function PrivacySecurityScreen() {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Typography style={styles.headerTitle}>Privacy & Security</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {SECTIONS.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Typography style={styles.sectionLabel}>{section.title}</Typography>
                        <View style={styles.card}>
                            {section.items.map((item, i) => (
                                <View key={item.label} style={[styles.row, i > 0 && styles.rowBorder]}>
                                    <View style={styles.rowIcon}>
                                        <Ionicons name={item.icon as any} size={18} color="#000" />
                                    </View>
                                    <View style={styles.rowText}>
                                        <Typography style={styles.rowLabel}>{item.label}</Typography>
                                        <Typography style={styles.rowSub}>{item.sub}</Typography>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.noteCard}>
                    <Ionicons name="shield-outline" size={20} color="#22c55e" />
                    <Typography style={styles.noteText}>
                        Your account and payments are protected by Clerk Auth and Razorpay's PCI-DSS compliant infrastructure.
                    </Typography>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 20, paddingBottom: 60 },
    section: { marginBottom: 28 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    rowBorder: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: '500', color: '#000', marginBottom: 2 },
    rowSub: { fontSize: 12, color: '#999' },
    noteCard: { flexDirection: 'row', gap: 12, backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, alignItems: 'flex-start' },
    noteText: { fontSize: 13, color: '#555', lineHeight: 20, flex: 1 },
});
