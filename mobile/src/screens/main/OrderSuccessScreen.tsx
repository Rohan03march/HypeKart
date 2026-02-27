import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderSuccessScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId, paymentId } = route.params || {};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.iconCircle}>
                    <LinearGradient colors={['#000', '#1a1a1a']} style={StyleSheet.absoluteFill as any} />
                    <Ionicons name="checkmark" size={52} color="#fff" />
                </View>

                <Typography style={styles.title}>Order Placed!</Typography>
                <Typography style={styles.subtitle}>
                    Your order has been confirmed and is being processed.
                </Typography>

                {/* Order Info */}
                <View style={styles.infoCard}>
                    {orderId && (
                        <View style={styles.infoRow}>
                            <Typography style={styles.infoLabel}>Order ID</Typography>
                            <Typography style={styles.infoValue} numberOfLines={1}>
                                {String(orderId).split('-')[0].toUpperCase()}
                            </Typography>
                        </View>
                    )}
                    {paymentId && (
                        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
                            <Typography style={styles.infoLabel}>Payment ID</Typography>
                            <Typography style={styles.infoValue} numberOfLines={1}>{paymentId}</Typography>
                        </View>
                    )}
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={styles.ctaBtn}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                    activeOpacity={0.9}
                >
                    <LinearGradient colors={['#000', '#1a1a1a']} style={styles.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Typography style={styles.ctaText}>Continue Shopping</Typography>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    iconCircle: {
        width: 120, height: 120, borderRadius: 60,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 32, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    },
    title: { fontSize: 34, fontWeight: '300', color: '#000', letterSpacing: -1, marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
    infoCard: {
        width: '100%', backgroundColor: '#fff', borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
        marginBottom: 32, overflow: 'hidden',
    },
    infoRow: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoLabel: { fontSize: 13, color: '#999', fontWeight: '500' },
    infoValue: { fontSize: 13, color: '#000', fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 12 },
    ctaBtn: {
        width: '100%', height: 56, borderRadius: 28,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 12, elevation: 5,
    },
    ctaGradient: { flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    ctaText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
