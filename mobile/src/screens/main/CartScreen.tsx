import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CartScreenSkeleton } from '../../components/ui/SkeletonLoader';
import { useAuth } from '@clerk/clerk-expo';

const FREE_SHIPPING_THRESHOLD = 1500;

export default function CartScreen() {
    const { items, removeItem, updateQuantity, getCartTotal, getCartCount, expiresAt, clearCart } = useCartStore();
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const navigation = useNavigation<any>();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const { userId } = useAuth();

    const [promoCode, setPromoCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountValue: number; discountType: 'percentage' | 'fixed' } | null>(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;

        setIsApplyingPromo(true);
        setPromoError('');
        try {
            const response = await fetch(`${API_URL}/cart/apply-coupon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, cartTotal: total })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setAppliedCoupon(data.coupon);
                setPromoCode('');
            } else {
                setPromoError(data.error || 'Invalid or expired promo code.');
            }
        } catch (err) {
            setPromoError('Network error. Please try again.');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    const handleRemoveItem = async (productId: string, cartItemId: string) => {
        // 1. Instantly remove from local UI so it feels snappy
        removeItem(cartItemId);

        if (!userId) return;

        // 2. Tell backend to surrender the 10-minute reservation early
        try {
            await fetch(`${API_URL}/cart/release`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    user_clerk_id: userId
                })
            });
        } catch (error) {
            console.error('Failed to release reservation:', error);
            // We ignore errors here since the item is out of their cart 
            // and the 10-minute timeout cron will catch it eventually anyway.
        }
    };

    const handleIncreaseQuantity = async (productId: string, cartItemId: string, currentQuantity: number) => {
        if (!userId) return;

        // Optimistic update — feels instant to the user
        updateQuantity(cartItemId, currentQuantity + 1);

        try {
            const response = await fetch(`${API_URL}/cart/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity: 1, user_clerk_id: userId })
            });

            if (!response.ok) {
                // Stock unavailable — roll back the optimistic increment
                updateQuantity(cartItemId, currentQuantity);
                Alert.alert('Maximum Reached', 'There is no more stock available for this item.');
            }
        } catch (error) {
            // Network error — roll back
            updateQuantity(cartItemId, currentQuantity);
            console.error('Failed to increase quantity lock', error);
        }
    };

    const handleDecreaseQuantity = async (productId: string, cartItemId: string, currentQuantity: number) => {
        if (!userId) return;

        if (currentQuantity <= 1) {
            // Let the X button handle full removals
            return;
        }

        // Optimistic update — feels instant
        updateQuantity(cartItemId, currentQuantity - 1);

        // Fire-and-forget: release 1 lock in the background
        fetch(`${API_URL}/cart/release-partial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, user_clerk_id: userId })
        }).catch(error => {
            console.error('Failed to release partial quantity lock', error);
            // Don't roll back — the UI decrement is safe, cron will handle expiry
        });
    };

    useEffect(() => {
        const t = setTimeout(() => setIsInitialLoading(false), 700);
        return () => clearTimeout(t);
    }, []);

    const total = getCartTotal();
    const itemCount = getCartCount();

    // Calculate Discount
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
            discountAmount = total * (appliedCoupon.discountValue / 100);
        } else {
            discountAmount = appliedCoupon.discountValue;
        }
    }
    const discountedTotal = Math.max(0, total - discountAmount);

    const tax = discountedTotal * 0.18; // 18% GST (applied after discount)
    const shipping = discountedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
    const finalTotal = discountedTotal + tax + shipping;
    const shippingProgress = Math.min(discountedTotal / FREE_SHIPPING_THRESHOLD, 1);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';
    const imgBgColor = isDarkMode ? '#333' : '#f5f5f5';

    const [timeLeft, setTimeLeft] = useState<string>('');

    // Timer Logic
    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft('');
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const difference = expiresAt - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft('00:00');

                // Expiry Action
                Alert.alert(
                    "Time Expired",
                    "Your 10-minute reservation has expired and the items have been released.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                clearCart();
                                navigation.navigate('Home');
                            }
                        }
                    ]
                );
            } else {
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, clearCart, navigation]);

    if (isInitialLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
                <CartScreenSkeleton />
            </SafeAreaView>
        );
    }

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
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={textColor} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Typography style={[styles.headerTitle, { color: textColor }]}>Shopping Bag</Typography>
                    <Typography style={[styles.headerSubtitle, { color: subtextColor }]}>{itemCount} items</Typography>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Favorites')} style={styles.headerBtn}>
                    <Ionicons name="heart-outline" size={22} color={textColor} />
                </TouchableOpacity>
            </View>

            {/* Timer Banner */}
            {timeLeft !== '' && (
                <View style={{ backgroundColor: '#000', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                    <Ionicons name="time-outline" size={18} color="#fff" />
                    <Typography style={{ color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>
                        Items reserved for <Typography style={{ color: '#ff3b30' }}>{timeLeft}</Typography>
                    </Typography>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>

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
                                    <TouchableOpacity onPress={() => handleRemoveItem(item.productId, item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Ionicons name="close" size={20} color={subtextColor} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
                                    <Typography style={[styles.itemPrice, { color: textColor }]}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>

                                    <View style={[styles.quantityControl, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => handleDecreaseQuantity(item.productId, item.id, item.quantity)}
                                        >
                                            <Ionicons name="remove" size={16} color={textColor} />
                                        </TouchableOpacity>
                                        <Typography style={[styles.qtyText, { color: textColor }]}>{item.quantity}</Typography>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => handleIncreaseQuantity(item.productId, item.id, item.quantity)}
                                        >
                                            <Ionicons name="add" size={16} color={textColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Promo Code Input */}
                <View style={[styles.promoContainer, { backgroundColor: cardBgColor }]}>
                    {appliedCoupon ? (
                        <View style={[styles.appliedCouponCard, { backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4', borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#bbf7d0' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="pricetag" size={16} color="#16a34a" />
                                <Typography style={[styles.appliedCouponText, { color: '#16a34a' }]}>{appliedCoupon.code} Applied</Typography>
                            </View>
                            <TouchableOpacity onPress={handleRemoveCoupon}>
                                <Ionicons name="close-circle" size={20} color="#16a34a" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <Typography style={[styles.promoTitle, { color: textColor }]}>Have a promo code?</Typography>
                            <View style={[styles.promoInputRow, { borderColor: borderColor }]}>
                                <TextInput
                                    style={[styles.promoInput, { color: textColor }]}
                                    placeholder="Enter your code here"
                                    placeholderTextColor={subtextColor}
                                    value={promoCode}
                                    onChangeText={(text) => {
                                        setPromoCode(text.toUpperCase());
                                        setPromoError('');
                                    }}
                                    autoCapitalize="characters"
                                    editable={!isApplyingPromo}
                                />
                                <TouchableOpacity
                                    style={[styles.promoApplyBtn, { backgroundColor: promoCode.trim() ? textColor : borderColor }]}
                                    onPress={handleApplyPromo}
                                    disabled={!promoCode.trim() || isApplyingPromo}
                                >
                                    {isApplyingPromo ? (
                                        <ActivityIndicator size="small" color={bgColor} />
                                    ) : (
                                        <Typography style={[styles.promoApplyText, { color: bgColor }]}>Apply</Typography>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {promoError ? (
                                <Typography style={styles.promoErrorText}>{promoError}</Typography>
                            ) : null}
                        </View>
                    )}
                </View>

                {/* Order Summary */}
                <View style={[styles.summaryContainer, { backgroundColor: cardBgColor }]}>
                    <Typography style={[styles.summaryTitle, { color: textColor }]}>Order Summary</Typography>

                    <View style={styles.summaryRow}>
                        <Typography style={[styles.summaryLabel, { color: subtextColor }]}>Subtotal</Typography>
                        <Typography style={[styles.summaryValue, { color: textColor }]}>₹{total.toLocaleString('en-IN')}</Typography>
                    </View>

                    {discountAmount > 0 && (
                        <View style={styles.summaryRow}>
                            <Typography style={[styles.summaryLabel, { color: '#16a34a' }]}>Discount</Typography>
                            <Typography style={[styles.summaryValue, { color: '#16a34a' }]}>-₹{discountAmount.toLocaleString('en-IN')}</Typography>
                        </View>
                    )}

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

            {/* Checkout Button (Footer) */}
            <View style={styles.checkoutFooter}>
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
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerBtn: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
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
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
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
    },
    // Promo Code Styles
    promoContainer: {
        marginHorizontal: 24,
        marginTop: 24,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    promoTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    promoInputRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 12,
        height: 48,
        overflow: 'hidden',
    },
    promoInput: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 1,
    },
    promoApplyBtn: {
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoApplyText: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    promoErrorText: {
        color: '#dc2626',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '500',
    },
    appliedCouponCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    appliedCouponText: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
