import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const FREE_SHIPPING_THRESHOLD = 1500;

export default function CartScreen() {
    const { items, removeItem, updateQuantity, getCartTotal, getCartCount } = useCartStore();
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const navigation = useNavigation<any>();

    const total = getCartTotal();
    const itemCount = getCartCount();
    const tax = total * 0.18; // 18% GST
    const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
    const finalTotal = total + tax + shipping;
    const shippingProgress = Math.min(total / FREE_SHIPPING_THRESHOLD, 1);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';
    const imgBgColor = isDarkMode ? '#333' : '#f5f5f5';

    if (items.length === 0) {
        return (
            <SafeAreaView style={[styles.emptyContainer, { backgroundColor: bgColor }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: cardBgColor }]}>
                    <Ionicons name="bag-handle-outline" size={48} color={textColor} />
                </View>
                <Typography style={[styles.emptyTitle, { color: textColor }]}>Your bag is empty</Typography>
                <Typography style={[styles.emptySubtitle, { color: subtextColor }]}>
                    Discover the latest curated collections and secure your favorite pieces.
                </Typography>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.brutalistButton}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#000000', '#1a1a1a']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Typography style={styles.buttonText}>Shop Essentials</Typography>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: bgColor }]}>
                <Typography style={[styles.headerTitle, { color: textColor }]}>Shopping Bag</Typography>
                <Typography style={[styles.headerSubtitle, { color: subtextColor }]}>{itemCount} items</Typography>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 160 }}>

                {/* Free shipping banner */}
                <View style={styles.shippingBanner}>
                    <View style={[styles.shippingBannerInner, { backgroundColor: cardBgColor }]}>
                        {total < FREE_SHIPPING_THRESHOLD ? (
                            <>
                                <Typography style={[styles.shippingText, { color: subtextColor }]}>
                                    You're <Typography style={{ fontWeight: '700', color: textColor }}>₹{(FREE_SHIPPING_THRESHOLD - total).toLocaleString('en-IN')}</Typography> away from free shipping.
                                </Typography>
                                <View style={[styles.progressBarBg, { backgroundColor: borderColor }]}>
                                    <View style={[styles.progressBarFill, { width: `${shippingProgress * 100}%`, backgroundColor: textColor }]} />
                                </View>
                            </>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Ionicons name="checkmark-circle" size={20} color={textColor} />
                                <Typography style={[styles.shippingTextSuccess, { color: textColor }]}>
                                    Complimentary shipping unlocked.
                                </Typography>
                            </View>
                        )}
                    </View>
                </View>

                {/* Cart Items */}
                <View style={{ marginTop: 16, paddingHorizontal: 24 }}>
                    {items.map((item, index) => (
                        <View key={item.id} style={[styles.cartItem, { borderBottomColor: borderColor }]}>
                            <View style={[styles.itemImageContainer, { backgroundColor: imgBgColor }]}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                            </View>

                            <View style={styles.itemDetails}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View style={{ flex: 1, paddingRight: 16 }}>
                                        <Typography style={[styles.itemName, { color: textColor }]} numberOfLines={2}>{item.name}</Typography>
                                        <Typography style={[styles.itemMeta, { color: subtextColor }]}>Size: {item.size}  |  Color: {item.color}</Typography>
                                    </View>
                                    <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Ionicons name="close" size={20} color={subtextColor} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
                                    <Typography style={[styles.itemPrice, { color: textColor }]}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>

                                    <View style={[styles.quantityControl, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Ionicons name="remove" size={16} color={textColor} />
                                        </TouchableOpacity>
                                        <Typography style={[styles.qtyText, { color: textColor }]}>{item.quantity}</Typography>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Ionicons name="add" size={16} color={textColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={[styles.summaryContainer, { backgroundColor: cardBgColor }]}>
                    <Typography style={[styles.summaryTitle, { color: textColor }]}>Order Summary</Typography>

                    <View style={styles.summaryRow}>
                        <Typography style={[styles.summaryLabel, { color: subtextColor }]}>Subtotal</Typography>
                        <Typography style={[styles.summaryValue, { color: textColor }]}>₹{total.toLocaleString('en-IN')}</Typography>
                    </View>
                    <View style={styles.summaryRow}>
                        <Typography style={[styles.summaryLabel, { color: subtextColor }]}>Estimated Tax</Typography>
                        <Typography style={[styles.summaryValue, { color: textColor }]}>₹{tax.toLocaleString('en-IN')}</Typography>
                    </View>
                    <View style={styles.summaryRow}>
                        <Typography style={[styles.summaryLabel, { color: subtextColor }]}>Shipping</Typography>
                        <Typography style={[styles.summaryValue, { color: textColor }]}>
                            {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                        </Typography>
                    </View>

                    <View style={[styles.summaryDivider, { backgroundColor: borderColor }]} />

                    <View style={styles.totalRow}>
                        <Typography style={[styles.totalLabel, { color: textColor }]}>Total</Typography>
                        <Typography style={[styles.totalValue, { color: textColor }]}>₹{Math.round(finalTotal).toLocaleString('en-IN')}</Typography>
                    </View>
                </View>
            </ScrollView>

            {/* Checkout Button (Fixed Bottom) */}
            <View style={[styles.checkoutFooter, { backgroundColor: isDarkMode ? 'rgba(18,18,18,0.8)' : 'rgba(250,250,250,0.8)', borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('Checkout')}
                    style={styles.checkoutButton}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#000000', '#1a1a1a']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Typography style={{ color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 }}>
                            Checkout  •  ₹{Math.round(finalTotal).toLocaleString('en-IN')}
                        </Typography>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        backgroundColor: '#fafafa',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
    },
    emptyTitle: {
        fontSize: 28,
        fontWeight: '300',
        color: '#000',
        marginBottom: 12,
        letterSpacing: -0.5
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
        paddingHorizontal: 20
    },
    brutalistButton: {
        width: 200,
        height: 56,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonGradient: {
        flex: 1,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fafafa',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '300',
        color: '#000',
        letterSpacing: -1
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500'
    },
    shippingBanner: {
        marginHorizontal: 24,
        marginTop: 8,
        marginBottom: 8,
    },
    shippingBannerInner: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    shippingText: {
        color: '#666',
        fontSize: 13,
        marginBottom: 10,
        textAlign: 'center'
    },
    shippingTextSuccess: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 2
    },
    cartItem: {
        flexDirection: 'row',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemImageContainer: {
        width: 100,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between'
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 6,
        lineHeight: 22
    },
    itemMeta: {
        fontSize: 13,
        color: '#666',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000'
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        height: 36,
    },
    qtyBtn: {
        width: 36,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        minWidth: 24,
        textAlign: 'center',
        color: '#000',
        fontWeight: '600',
        fontSize: 14
    },
    summaryContainer: {
        marginHorizontal: 24,
        marginTop: 32,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 20
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    summaryLabel: {
        color: '#666',
        fontSize: 14,
    },
    summaryValue: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500'
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 16
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000'
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        letterSpacing: -0.5
    },
    checkoutFooter: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 104 : 94, // 64 (tab height) + 24/34 (tab bottom) + margin
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(250,250,250,0.8)'
    },
    checkoutButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    }
});
