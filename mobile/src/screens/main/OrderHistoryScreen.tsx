import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { getUserOrders } from '../../lib/getUserOrders';
import { useCartStore } from '../../store/cartStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    Placed: { bg: '#f5f5f5', text: '#666' },
    Processing: { bg: '#eff6ff', text: '#3b82f6' },
    Shipped: { bg: '#fff7ed', text: '#f97316' },
    'Out for Delivery': { bg: '#faf5ff', text: '#a855f7' },
    Delivered: { bg: '#f0fdf4', text: '#22c55e' },
    Cancelled: { bg: '#fef2f2', text: '#ef4444' },
    'Return Requested': { bg: '#fefce8', text: '#ca8a04' },
};

export default function OrderHistoryScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const { addItem } = useCartStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!user?.id) { setIsLoading(false); return; }
        try {
            const data = await getUserOrders(user.id);
            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchOrders();
        setIsRefreshing(false);
    }, [fetchOrders]);

    const handleCancel = (orderId: string) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setCancellingId(orderId);
                        try {
                            const res = await fetch(`${API_URL}/admin/update-order-status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId, status: 'Cancelled' }),
                            });
                            if (!res.ok) throw new Error('Failed to cancel');
                            setOrders(prev =>
                                prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o)
                            );
                        } catch {
                            Alert.alert('Error', 'Could not cancel order. Please try again.');
                        } finally {
                            setCancellingId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleRepurchase = (items: any[]) => {
        if (!items || items.length === 0) return;
        items.forEach(item => {
            addItem({
                productId: item.product_id,
                name: item.name,
                price: item.price,
                image: item.image,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
            });
        });
        Alert.alert('Added to Cart', 'All items have been added to your cart!', [
            { text: 'Go to Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
            { text: 'Continue', style: 'cancel' },
        ]);
    };

    const handleReturn = (orderId: string) => {
        Alert.alert(
            'Request Return',
            'Submit a return request for this order? Our team will contact you within 24 hours.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit Return',
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/admin/update-order-status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId, status: 'Return Requested' }),
                            });
                            if (!res.ok) throw new Error('Failed');
                            setOrders(prev =>
                                prev.map(o => o.id === orderId ? { ...o, status: 'Return Requested' } : o)
                            );
                            Alert.alert('Return Submitted ✓', 'We\'ve received your return request. You\'ll be contacted shortly.');
                        } catch {
                            Alert.alert('Error', 'Could not submit return. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Typography style={styles.headerTitle}>Order History</Typography>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator color="#000" style={{ marginTop: 60 }} />
            ) : orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="bag-handle-outline" size={36} color="#ccc" />
                    </View>
                    <Typography style={styles.emptyTitle}>No orders yet</Typography>
                    <Typography style={styles.emptySubtitle}>Your order history will appear here.</Typography>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#000" colors={['#000']} />}
                >
                    {orders.map((order: any) => {
                        const items: any[] = order.order_items || [];
                        const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.Placed;
                        const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        });
                        const canCancel = order.status === 'Placed';
                        const canReturn = order.status === 'Delivered';
                        const isCancelled = order.status === 'Cancelled';

                        return (
                            <View key={order.id} style={styles.orderCard}>
                                {/* Order header */}
                                <View style={styles.orderHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Typography style={styles.orderId}>#{order.id.split('-')[0].toUpperCase()}</Typography>
                                        <Typography style={styles.orderDate}>{date}</Typography>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Typography style={[styles.statusText, { color: statusStyle.text }]}>
                                            {order.status}
                                        </Typography>
                                    </View>
                                </View>

                                {/* Item thumbnails */}
                                {items.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsRow} contentContainerStyle={{ gap: 10 }}>
                                        {items.map((item: any, i: number) => (
                                            <View key={i} style={styles.itemThumb}>
                                                {item.image
                                                    ? <Image source={{ uri: item.image }} style={styles.thumbImg} resizeMode="cover" />
                                                    : <Ionicons name="image-outline" size={24} color="#ccc" />
                                                }
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}

                                {/* Items detail */}
                                {items.map((item: any, i: number) => (
                                    <View key={i} style={[styles.itemRow, i > 0 && styles.itemBorder]}>
                                        <View style={{ flex: 1 }}>
                                            <Typography style={styles.itemName} numberOfLines={1}>{item.name}</Typography>
                                            <Typography style={styles.itemMeta}>
                                                {[item.size, item.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}
                                            </Typography>
                                        </View>
                                        {i === 0 && (
                                            <Typography style={styles.orderTotal}>₹{Number(order.total_amount).toLocaleString('en-IN')}</Typography>
                                        )}
                                    </View>
                                ))}


                                {/* Action buttons */}
                                {!isCancelled && (
                                    <View style={styles.actionsRow}>
                                        {/* Repurchase — always available (if not cancelled) */}
                                        <TouchableOpacity
                                            style={styles.actionBtnOutline}
                                            onPress={() => handleRepurchase(items)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="refresh-outline" size={15} color="#000" />
                                            <Typography style={styles.actionBtnOutlineText}>Repurchase</Typography>
                                        </TouchableOpacity>

                                        {/* Cancel — only when Placed */}
                                        {canCancel && (
                                            <TouchableOpacity
                                                style={[styles.actionBtnOutline, styles.actionBtnRed]}
                                                onPress={() => handleCancel(order.id)}
                                                disabled={cancellingId === order.id}
                                                activeOpacity={0.7}
                                            >
                                                {cancellingId === order.id
                                                    ? <ActivityIndicator size="small" color="#ef4444" />
                                                    : <>
                                                        <Ionicons name="close-circle-outline" size={15} color="#ef4444" />
                                                        <Typography style={[styles.actionBtnOutlineText, { color: '#ef4444' }]}>Cancel</Typography>
                                                    </>
                                                }
                                            </TouchableOpacity>
                                        )}

                                        {/* Return — only when Delivered */}
                                        {canReturn && (
                                            <TouchableOpacity
                                                style={[styles.actionBtnOutline, styles.actionBtnOrange]}
                                                onPress={() => handleReturn(order.id)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="return-up-back-outline" size={15} color="#f97316" />
                                                <Typography style={[styles.actionBtnOutlineText, { color: '#f97316' }]}>Return</Typography>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })}
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
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '500', color: '#000', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center' },
    orderCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    orderId: { fontSize: 14, fontWeight: '700', color: '#000' },
    orderTotal: { fontSize: 15, fontWeight: '700', color: '#000' },
    orderDate: { fontSize: 12, color: '#999', marginTop: 2 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    itemsRow: { paddingHorizontal: 16, paddingVertical: 12 },
    itemThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#f5f5f5', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    thumbImg: { width: '100%', height: '100%' },
    itemRow: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
    itemBorder: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    itemName: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 3 },
    itemMeta: { fontSize: 12, color: '#999' },
    itemPrice: { fontSize: 14, fontWeight: '600', color: '#000', marginLeft: 12 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#f5f5f5', backgroundColor: '#fafafa' },
    totalLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
    totalValue: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: -0.3 },
    actionsRow: { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 0, flexWrap: 'wrap' },
    actionBtnOutline: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
        borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fff',
    },
    actionBtnOutlineText: { fontSize: 13, fontWeight: '600', color: '#000' },
    actionBtnRed: { borderColor: '#fecaca' },
    actionBtnOrange: { borderColor: '#fed7aa' },
});
