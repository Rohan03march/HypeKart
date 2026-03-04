import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { getUserOrders } from '../../lib/getUserOrders';
import { useCartStore } from '../../store/cartStore';
import { useCacheStore } from '../../store/cacheStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const STATUS_COLORS: Record<string, { lightBg: string; lightText: string; darkBg: string; darkText: string }> = {
    Placed: { lightBg: '#f5f5f5', lightText: '#666', darkBg: '#333', darkText: '#ccc' },
    Processing: { lightBg: '#eff6ff', lightText: '#3b82f6', darkBg: '#1e3a8a', darkText: '#93c5fd' },
    Shipped: { lightBg: '#fff7ed', lightText: '#f97316', darkBg: '#7c2d12', darkText: '#fdba74' },
    'Out for Delivery': { lightBg: '#faf5ff', lightText: '#a855f7', darkBg: '#4c1d95', darkText: '#d8b4fe' },
    Delivered: { lightBg: '#f0fdf4', lightText: '#22c55e', darkBg: '#14532d', darkText: '#86efac' },
    Cancelled: { lightBg: '#fef2f2', lightText: '#ef4444', darkBg: '#7f1d1d', darkText: '#fca5a5' },
    'Return Requested': { lightBg: '#fefce8', lightText: '#ca8a04', darkBg: '#713f12', darkText: '#fde047' },
};

const OrderCard = memo(({ order, onRepurchase, onCancel, onReturn, cancellingId, isDarkMode }: any) => {
    const items: any[] = order.order_items || [];
    const statusObj = STATUS_COLORS[order.status] || STATUS_COLORS.Placed;
    const statusStyle = {
        bg: isDarkMode ? statusObj.darkBg : statusObj.lightBg,
        text: isDarkMode ? statusObj.darkText : statusObj.lightText
    };

    const bgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#999';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';
    const thumbBg = isDarkMode ? '#333' : '#f5f5f5';
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const canCancel = order.status === 'Placed';
    const canReturn = order.status === 'Delivered';
    const isCancelled = order.status === 'Cancelled';

    return (
        <View style={[styles.orderCard, { backgroundColor: bgColor }]}>
            <View style={[styles.orderHeader, { borderBottomColor: borderColor }]}>
                <View style={{ flex: 1 }}>
                    <Typography style={[styles.orderId, { color: textColor }]}>#{order.id.split('-')[0].toUpperCase()}</Typography>
                    <Typography style={[styles.orderDate, { color: subtextColor }]}>{date}</Typography>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Typography style={[styles.statusText, { color: statusStyle.text }]}>
                        {order.status}
                    </Typography>
                </View>
            </View>

            {items.length > 0 && (
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={items}
                    keyExtractor={(item, idx) => item.product_id + idx.toString()}
                    style={styles.itemsRow}
                    contentContainerStyle={{ gap: 10 }}
                    initialNumToRender={4}
                    renderItem={({ item }) => (
                        <View style={[styles.itemThumb, { backgroundColor: thumbBg }]}>
                            {item.image
                                ? <Image source={{ uri: item.image }} style={styles.thumbImg} contentFit="cover" cachePolicy="memory-disk" />
                                : <Ionicons name="image-outline" size={24} color={subtextColor} />
                            }
                        </View>
                    )}
                />
            )}

            {items.map((item: any, i: number) => (
                <View key={i} style={[styles.itemRow, i > 0 && [styles.itemBorder, { borderTopColor: borderColor }]]}>
                    <View style={{ flex: 1 }}>
                        <Typography style={[styles.itemName, { color: textColor }]} numberOfLines={1}>{item.name}</Typography>
                        <Typography style={[styles.itemMeta, { color: subtextColor }]}>
                            {[item.size, item.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}
                        </Typography>
                    </View>
                    {i === 0 && (
                        <Typography style={[styles.orderTotal, { color: textColor }]}>₹{Number(order.total_amount).toLocaleString('en-IN')}</Typography>
                    )}
                </View>
            ))}

            {!isCancelled && (
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={[styles.actionBtnOutline, { backgroundColor: bgColor, borderColor }]} onPress={() => onRepurchase(items)} activeOpacity={0.7}>
                        <Ionicons name="refresh-outline" size={15} color={textColor} />
                        <Typography style={[styles.actionBtnOutlineText, { color: textColor }]}>Repurchase</Typography>
                    </TouchableOpacity>

                    {canCancel && (
                        <TouchableOpacity
                            style={[styles.actionBtnOutline, { backgroundColor: bgColor, borderColor: '#fca5a5' }]}
                            onPress={() => onCancel(order.id)}
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

                    {canReturn && (
                        <TouchableOpacity style={[styles.actionBtnOutline, { backgroundColor: bgColor, borderColor: '#fdba74' }]} onPress={() => onReturn(order.id)} activeOpacity={0.7}>
                            <Ionicons name="return-up-back-outline" size={15} color="#f97316" />
                            <Typography style={[styles.actionBtnOutlineText, { color: '#f97316' }]}>Return</Typography>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
});

export default function OrderHistoryScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const { addItem } = useCartStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const { getOrders, setOrders: cacheOrders } = useCacheStore();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const mainBgColor = isDarkMode ? '#121212' : '#fafafa';
    const mainTextColor = isDarkMode ? '#fff' : '#000';
    const mainSubtextColor = isDarkMode ? '#aaa' : '#999';
    const headerBtnBg = isDarkMode ? '#1e1e1e' : '#f5f5f5';

    const fetchOrders = useCallback(async (forceRefresh = false) => {
        if (!user?.id) { setIsLoading(false); return; }
        try {
            if (!forceRefresh) {
                const cached = getOrders(user.id);
                if (cached) {
                    setOrders(cached);
                    setIsLoading(false);
                    return;
                }
            }

            const data = await getUserOrders(user.id);
            setOrders(data);
            cacheOrders(user.id, data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, getOrders, cacheOrders]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchOrders(true);
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
        <SafeAreaView style={[styles.container, { backgroundColor: mainBgColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: headerBtnBg }]}>
                    <Ionicons name="arrow-back" size={20} color={mainTextColor} />
                </TouchableOpacity>
                <Typography style={[styles.headerTitle, { color: mainTextColor }]}>Order History</Typography>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator color={mainTextColor} style={{ marginTop: 60 }} />
            ) : orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIcon, { backgroundColor: headerBtnBg }]}>
                        <Ionicons name="bag-handle-outline" size={36} color={mainSubtextColor} />
                    </View>
                    <Typography style={[styles.emptyTitle, { color: mainTextColor }]}>No orders yet</Typography>
                    <Typography style={[styles.emptySubtitle, { color: mainSubtextColor }]}>Your order history will appear here.</Typography>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(order) => order.id}
                    renderItem={({ item: order }) => (
                        <OrderCard
                            order={order}
                            onRepurchase={handleRepurchase}
                            onCancel={handleCancel}
                            onReturn={handleReturn}
                            cancellingId={cancellingId}
                            isDarkMode={isDarkMode}
                        />
                    )}
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={mainTextColor} colors={[mainTextColor]} />}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
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
