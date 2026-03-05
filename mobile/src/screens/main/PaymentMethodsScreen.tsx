import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { usePaymentStore, PAYMENT_OPTIONS, PaymentMethodType } from '../../store/paymentStore';

export default function PaymentMethodsScreen() {
    const navigation = useNavigation<any>();
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const { preferredMethodId, setPreferredMethod } = usePaymentStore();

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const subtextColor = isDarkMode ? '#ccc' : '#666';
    const activeColor = isDarkMode ? '#fff' : '#000';
    const inactiveColor = isDarkMode ? '#444' : '#e5e5e5';
    const faintText = isDarkMode ? '#888' : '#999';

    const handleSelect = (id: PaymentMethodType) => {
        setPreferredMethod(id);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBgColor }]}>
                    <Ionicons name="arrow-back" size={20} color={textColor} />
                </TouchableOpacity>
                <Typography style={[styles.headerTitle, { color: textColor }]}>Payment Methods</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.infoCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="shield-checkmark" size={24} color={textColor} style={{ marginBottom: 8 }} />
                    <Typography style={[styles.infoTitle, { color: textColor }]}>Secured by Razorpay</Typography>
                    <Typography style={[styles.infoText, { color: subtextColor }]}>
                        We encrypt and securely process all transactions via Razorpay. Your actual payment details are never stored on our servers.
                    </Typography>
                </View>

                <Typography style={[styles.sectionTitle, { color: faintText }]}>Default Payment Option</Typography>

                <View style={[styles.listContainer, { backgroundColor: cardBgColor }]}>
                    {PAYMENT_OPTIONS.map((option, index) => {
                        const isSelected = preferredMethodId === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionRow,
                                    index < PAYMENT_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }
                                ]}
                                onPress={() => handleSelect(option.id)}
                            >
                                <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}>
                                    <Ionicons name={option.icon as any} size={22} color={textColor} />
                                </View>

                                <View style={styles.optionContent}>
                                    <Typography style={[styles.optionLabel, { color: textColor }]}>{option.label}</Typography>
                                    <Typography style={[styles.optionDesc, { color: subtextColor }]}>{option.description}</Typography>
                                </View>

                                {/* Radio Button */}
                                <View style={[styles.radioOuter, { borderColor: isSelected ? activeColor : inactiveColor }]}>
                                    {isSelected && <View style={[styles.radioInner, { backgroundColor: activeColor }]} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Typography style={[styles.footerText, { color: faintText }]}>
                    Selecting a default method speeds up your checkout by opening your preferred app (like UPI or Netbanking) immediately when you press Pay.
                </Typography>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    infoCard: {
        padding: 24, borderRadius: 20, marginBottom: 32,
    },
    infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    infoText: { fontSize: 14, lineHeight: 20 },
    sectionTitle: {
        fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: 12, marginLeft: 8
    },
    listContainer: {
        borderRadius: 24, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    optionRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20,
    },
    iconBox: {
        width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    optionContent: { flex: 1, paddingRight: 16 },
    optionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    optionDesc: { fontSize: 13 },
    radioOuter: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
    },
    radioInner: {
        width: 12, height: 12, borderRadius: 6,
    },
    footerText: {
        fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 32, paddingHorizontal: 16,
    }
});
