import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { getUserOrders } from '../../lib/getUserOrders';

export default function ShippingAddressScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const [address, setAddress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) { setIsLoading(false); return; }
        getUserOrders(user.id)
            .then(orders => {
                if (orders.length > 0 && orders[0].shipping_address) {
                    setAddress(orders[0].shipping_address);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [user?.id]);

    const fields = address ? [
        { label: 'Full Name', value: address.full_name },
        { label: 'Phone', value: address.phone },
        { label: 'Address', value: address.address },
        { label: 'City', value: address.city },
        { label: 'State', value: address.state },
        { label: 'Pincode', value: address.pincode },
    ] : [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Typography style={styles.headerTitle}>Shipping Address</Typography>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator color="#000" style={{ marginTop: 60 }} />
            ) : !address ? (
                <View style={styles.empty}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="location-outline" size={36} color="#ccc" />
                    </View>
                    <Typography style={styles.emptyTitle}>No address found</Typography>
                    <Typography style={styles.emptySubtitle}>
                        Your last-used delivery address will appear here after your first order.
                    </Typography>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Typography style={styles.sectionLabel}>Last used delivery address</Typography>
                    <View style={styles.card}>
                        {fields.map((f, i) => f.value ? (
                            <View key={f.label} style={[styles.row, i > 0 && styles.rowBorder]}>
                                <Typography style={styles.fieldLabel}>{f.label}</Typography>
                                <Typography style={styles.fieldValue}>{f.value}</Typography>
                            </View>
                        ) : null)}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 20 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
    row: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowBorder: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    fieldLabel: { fontSize: 13, color: '#999', fontWeight: '500' },
    fieldValue: { fontSize: 14, color: '#000', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 12 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '500', color: '#000', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
});
