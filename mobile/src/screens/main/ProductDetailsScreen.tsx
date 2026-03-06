import React, { useState, useEffect } from 'react';
import {
    View, ScrollView, TouchableOpacity, Image,
    Dimensions, StyleSheet, StatusBar, Modal, TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useWishlistStore } from '../../store/wishlistStore';
import Carousel from 'react-native-reanimated-carousel';
import { useThemeStore } from '../../store/themeStore';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop';

// Maps common English color names to CSS hex so RN renders them correctly
const COLOR_MAP: Record<string, string> = {
    red: '#e11d48', crimson: '#dc143c', rose: '#f43f5e',
    orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
    green: '#22c55e', emerald: '#10b981', teal: '#14b8a6',
    blue: '#3b82f6', navy: '#1e3a5f', indigo: '#6366f1',
    purple: '#a855f7', violet: '#8b5cf6', pink: '#ec4899',
    white: '#ffffff', offwhite: '#f5f5f5', ivory: '#fffff0',
    black: '#000000', charcoal: '#374151', gray: '#9ca3af',
    grey: '#9ca3af', silver: '#d1d5db', beige: '#d4b483',
    brown: '#92400e', tan: '#c9a96e', khaki: '#c3b091',
    gold: '#d4af37', cream: '#fffdd0',
};

const resolveColor = (raw: string): string => {
    if (!raw) return '#ccc';
    const trimmed = raw.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) return trimmed;
    return COLOR_MAP[trimmed.toLowerCase()] ?? trimmed.toLowerCase();
};

export default function ProductDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const addItem = useCartStore(state => state.addItem);

    const product = route.params?.product;

    const productId: string = product?.id ?? '';
    const productName: string = product?.title ?? product?.name ?? 'Product';
    const productBrand: string = product?.brand ?? 'HYPEKART';
    const productPrice: number = product?.base_price ?? product?.price ?? 0;
    const productStock: number = typeof product?.stock === 'number' ? product.stock : 99; // Default high if undocumented
    const productDescription: string = product?.description ?? 'No description available.';
    const productImages: string[] = (product?.images && product.images.length > 0)
        ? product.images
        : [FALLBACK_IMAGE];

    const sizeOptions: string[] = product?.sizes ?? ['S', 'M', 'L', 'XL'];
    const colorOptions: string[] = product?.colors ?? ['#1a1a1a', '#9ca3af', '#e5e7eb'];

    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [added, setAdded] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isSizeGuideVisible, setIsSizeGuideVisible] = useState(false);
    const [sizeCategory, setSizeCategory] = useState<'apparel' | 'footwear'>('apparel');
    const { toggle, isWishlisted } = useWishlistStore();
    const isFavorite = isWishlisted(productId);
    const insets = useSafeAreaInsets();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const [liveStock, setLiveStock] = useState<number>(productStock);

    // Real-time Supabase subscription for stock updates
    useEffect(() => {
        if (!productId) return;

        // Initialize with default from params
        setLiveStock(productStock);

        const channel = supabase
            .channel(`public:products:id=${productId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                    filter: `id=eq.${productId}`
                },
                (payload) => {
                    const newRecord = payload.new as any;
                    if (newRecord && typeof newRecord.stock === 'number') {
                        setLiveStock(newRecord.stock);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId, productStock]);

    const bgColor = isDarkMode ? '#121212' : '#fff';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';
    const modalBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const chipBg = isDarkMode ? '#333' : '#f5f5f5';
    const chipBorder = isDarkMode ? '#444' : '#f5f5f5';
    const imageBg = isDarkMode ? '#1e1e1e' : '#f3f3f3';

    const { userId } = useAuth();

    // ... we need more imports, I will do this in the next replacement
    const handleAddToCart = async () => {
        if (!userId) {
            alert('Please log in to add items to your bag.');
            return;
        }

        try {
            setIsAddingToCart(true);
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${API_URL}/cart/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1,
                    user_clerk_id: userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Sorry, this item is currently unavailable.');
                return;
            }

            // Always reserve the stock server-side.
            // Timer only shows in cart when stock was exactly 1 (last-item urgency).
            addItem({
                productId,
                name: productName,
                price: productPrice,
                image: productImages[0],
                size: selectedSize,
                color: selectedColor,
                quantity: 1,
                isReserved: liveStock === 1,
            });

            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
            navigation.navigate('MainTabs' as never, { screen: 'Cart' } as never);

        } catch (error) {
            console.error('Reservation Error:', error);
            alert('A network error occurred while reserving the item.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            {/* Fixed header — always visible at top, outside ScrollView */}
            <View style={[styles.imageHeader, { top: insets.top + 8 }]} pointerEvents="box-none">
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggle({
                    id: productId,
                    title: productName,
                    brand: productBrand,
                    price: productPrice,
                    image: productImages[0],
                    images: productImages,
                    description: productDescription,
                    sizes: sizeOptions,
                    colors: colorOptions,
                })} style={styles.headerBtn}>
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite ? '#ff4b4b' : '#fff'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

                {/* Main Image Carousel */}
                <View style={[styles.mainImageContainer, { backgroundColor: imageBg }]}>
                    {productImages.length > 1 ? (
                        <Carousel
                            loop
                            width={width}
                            height={width * 1.25}
                            autoPlay={false}
                            data={productImages}
                            scrollAnimationDuration={600}
                            onSnapToItem={(index) => setActiveIndex(index)}
                            renderItem={({ item }) => (
                                <Image source={{ uri: item }} style={styles.mainImage} resizeMode="cover" />
                            )}
                        />
                    ) : (
                        <Image source={{ uri: productImages[0] }} style={styles.mainImage} resizeMode="cover" />
                    )}

                    {/* Pagination Dots (if multiple images) */}
                    {productImages.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {productImages.map((_, index) => (
                                <View key={index} style={[styles.dot, activeIndex === index && { backgroundColor: isDarkMode ? '#fff' : '#000', width: 16 }]} />
                            ))}
                        </View>
                    )}

                    {/* Brand pill overlay */}
                    <View style={styles.brandOverlay}>
                        <BlurView intensity={40} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                        <Typography style={[styles.brandOverlayText, { color: textColor }]}>{productBrand}</Typography>
                    </View>
                </View>

                {/* Product Info */}
                <View style={[styles.content]}>

                    {/* Name */}
                    <Typography style={[styles.productName, { color: textColor }]} numberOfLines={2}>
                        {productName}
                    </Typography>

                    {/* Price below name */}
                    <View style={styles.priceRow}>
                        <Typography style={[styles.priceText, { color: textColor }]}>₹{productPrice.toLocaleString('en-IN')}</Typography>

                        {liveStock === 0 && (
                            <View style={styles.stockBadgeOut}>
                                <Typography style={styles.stockBadgeTextOut}>Sold Out</Typography>
                            </View>
                        )}
                        {liveStock > 0 && liveStock <= 5 && (
                            <View style={styles.stockBadgeLow}>
                                <View style={styles.stockIconContainer}>
                                    <Ionicons name="flash" size={12} color="#fff" />
                                </View>
                                <Typography style={styles.stockBadgeTextLow}>Only {liveStock} left</Typography>
                            </View>
                        )}
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* Color Selection */}
                    {colorOptions.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Typography style={styles.sectionLabel}>COLOR</Typography>
                                <Typography style={[styles.sectionValue, { color: textColor }]}>{selectedColor}</Typography>
                            </View>
                            <View style={styles.colorRow}>
                                {colorOptions.map((color) => {
                                    const isActive = selectedColor === color;
                                    return (
                                        <TouchableOpacity
                                            key={color}
                                            onPress={() => setSelectedColor(color)}
                                            style={[styles.colorRing, isActive && { borderColor: textColor }]}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.colorCircle, { backgroundColor: resolveColor(color) }]} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Size Selection */}
                    {sizeOptions.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Typography style={styles.sectionLabel}>SIZE</Typography>
                                <TouchableOpacity onPress={() => setIsSizeGuideVisible(true)}>
                                    <Typography style={[styles.guideLink, { color: subtextColor }]}>Size Guide →</Typography>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeRow}>
                                {sizeOptions.map((size) => {
                                    const isActive = selectedSize === size;
                                    return (
                                        <TouchableOpacity
                                            key={size}
                                            onPress={() => setSelectedSize(size)}
                                            style={[styles.sizeChip, { backgroundColor: chipBg, borderColor: chipBorder }, isActive && { backgroundColor: textColor, borderColor: textColor }]}
                                            activeOpacity={0.8}
                                        >
                                            <Typography style={[styles.sizeText, { color: textColor }, isActive && { color: bgColor, fontWeight: '600' }]}>
                                                {size}
                                            </Typography>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    {/* Description */}
                    <View style={styles.section}>
                        <Typography style={styles.sectionLabel}>DETAILS</Typography>
                        <Typography style={[styles.descriptionText, { color: subtextColor }]}>{productDescription}</Typography>
                    </View>

                </View>
            </ScrollView>

            {/* Floating CTA */}
            <View style={[styles.cta, { backgroundColor: isDarkMode ? 'rgba(18,18,18,0.85)' : 'rgba(255,255,255,0.85)', borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                    onPress={handleAddToCart}
                    style={styles.ctaButton}
                    activeOpacity={0.9}
                    disabled={added || isAddingToCart || liveStock === 0}
                >
                    <LinearGradient
                        colors={liveStock === 0 ? ['#9ca3af', '#6b7280'] : added ? ['#16a34a', '#15803d'] : ['#000', '#1a1a1a']}
                        style={styles.ctaGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {isAddingToCart ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : added ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Typography style={styles.ctaText}>Added to Bag</Typography>
                            </View>
                        ) : (
                            <Typography style={styles.ctaText}>
                                {liveStock === 0 ? "Sold Out" : `Add to Bag  ·  ₹${productPrice.toLocaleString('en-IN')}`}
                            </Typography>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Size Guide Modal */}
            <Modal
                visible={isSizeGuideVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsSizeGuideVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsSizeGuideVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
                                <View style={styles.modalHeader}>
                                    <Typography style={[styles.modalTitle, { color: textColor }]}>Size Guide</Typography>
                                    <TouchableOpacity onPress={() => setIsSizeGuideVisible(false)} style={styles.closeBtn}>
                                        <Ionicons name="close" size={24} color={textColor} />
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.modalTabs, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]}>
                                    <TouchableOpacity
                                        style={[styles.modalTab, sizeCategory === 'apparel' && { backgroundColor: isDarkMode ? '#555' : '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]}
                                        onPress={() => setSizeCategory('apparel')}
                                    >
                                        <Typography style={[styles.modalTabText, { color: sizeCategory === 'apparel' ? textColor : subtextColor }]}>Clothing</Typography>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalTab, sizeCategory === 'footwear' && { backgroundColor: isDarkMode ? '#555' : '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]}
                                        onPress={() => setSizeCategory('footwear')}
                                    >
                                        <Typography style={[styles.modalTabText, { color: sizeCategory === 'footwear' ? textColor : subtextColor }]}>Footwear</Typography>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                                    {sizeCategory === 'apparel' ? (
                                        <>
                                            <View style={[styles.tableRowHeader, { borderBottomColor: borderColor }]}>
                                                <Typography style={[styles.tableCellHeader, { color: subtextColor }]}>Size</Typography>
                                                <Typography style={[styles.tableCellHeader, { color: subtextColor }]}>Chest (in)</Typography>
                                                <Typography style={[styles.tableCellHeader, { color: subtextColor }]}>Length (in)</Typography>
                                            </View>
                                            {[
                                                { size: 'S', chest: '36-38', length: '27' },
                                                { size: 'M', chest: '38-40', length: '28' },
                                                { size: 'L', chest: '40-42', length: '29' },
                                                { size: 'XL', chest: '42-44', length: '30' },
                                                { size: 'XXL', chest: '44-46', length: '31' }
                                            ].map((row, i) => (
                                                <View key={i} style={[styles.tableRow, { borderBottomColor: borderColor }]}>
                                                    <Typography style={[styles.tableCell, { color: textColor }]}>{row.size}</Typography>
                                                    <Typography style={[styles.tableCell, { color: textColor }]}>{row.chest}</Typography>
                                                    <Typography style={[styles.tableCell, { color: textColor }]}>{row.length}</Typography>
                                                </View>
                                            ))}
                                            <Typography style={[styles.modalNote, { color: subtextColor }]}>
                                                * Fit may vary depending on style and brand. Please allow 1-2 inch tolerances due to manual measurement.
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <View style={[styles.tableRowHeader, { borderBottomColor: borderColor }]}>
                                                <Typography style={[styles.tableCellHeader, { flex: 1.2, color: subtextColor }]}>UK/India</Typography>
                                                <Typography style={[styles.tableCellHeader, { flex: 1.2, color: subtextColor }]}>US (Men)</Typography>
                                                <Typography style={[styles.tableCellHeader, { color: subtextColor }]}>EU</Typography>
                                                <Typography style={[styles.tableCellHeader, { color: subtextColor }]}>CM</Typography>
                                            </View>
                                            {[
                                                { uk: '6', us: '7', eu: '40', cm: '25' },
                                                { uk: '7', us: '8', eu: '41', cm: '26' },
                                                { uk: '8', us: '9', eu: '42.5', cm: '27' },
                                                { uk: '9', us: '10', eu: '44', cm: '28' },
                                                { uk: '10', us: '11', eu: '45', cm: '29' },
                                                { uk: '11', us: '12', eu: '46', cm: '30' }
                                            ].map((row, i) => (
                                                <View key={i} style={[styles.tableRow, { borderBottomColor: borderColor }]}>
                                                    <Typography style={[styles.tableCell, { flex: 1.2, color: textColor }]}>{row.uk}</Typography>
                                                    <Typography style={[styles.tableCell, { flex: 1.2, color: textColor }]}>{row.us}</Typography>
                                                    <Typography style={[styles.tableCell, { color: textColor }]}>{row.eu}</Typography>
                                                    <Typography style={[styles.tableCell, { color: textColor }]}>{row.cm}</Typography>
                                                </View>
                                            ))}
                                            <Typography style={[styles.modalNote, { color: subtextColor }]}>
                                                * Sizes are standard UK/India measurements. If you are between sizes, we recommend sizing up.
                                            </Typography>
                                        </>
                                    )}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageHeader: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 20,
    },
    headerBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Main image
    mainImageContainer: {
        width,
        height: width * 1.25,
        backgroundColor: '#f3f3f3',
        overflow: 'hidden',
    },
    mainImage: {
        width,
        height: width * 1.25,
    },
    brandOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
    },
    brandOverlayText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 24,
        right: 16,
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    activeDot: {
        backgroundColor: '#000',
        width: 16,
    },

    // Content
    content: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    productName: {
        fontSize: 26,
        fontWeight: '500',
        color: '#000',
        letterSpacing: -0.5,
        lineHeight: 32,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 24,
    },
    stockBadgeLow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 14,
        borderWidth: 1,
        borderColor: '#fee2e2',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    stockIconContainer: {
        backgroundColor: '#ef4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    stockBadgeTextLow: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ef4444',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    stockBadgeOut: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginLeft: 14,
    },
    stockBadgeTextOut: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9ca3af',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },

    // Sections
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#999',
        letterSpacing: 1.5,
    },
    sectionValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#444',
        textTransform: 'capitalize',
    },
    guideLink: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },

    // Colors
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorRing: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    colorRingActive: {
        borderColor: '#000',
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },

    // Sizes
    sizeRow: {
        gap: 10,
        paddingRight: 20,
    },
    sizeChip: {
        height: 46,
        minWidth: 46,
        paddingHorizontal: 18,
        borderRadius: 23,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#f5f5f5',
    },
    sizeChipActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    sizeText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#444',
    },
    sizeTextActive: {
        color: '#fff',
        fontWeight: '600',
    },

    // Description
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginTop: 10,
    },

    // CTA
    cta: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 36,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
        backgroundColor: 'rgba(255,255,255,0.85)',
    },
    ctaButton: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    ctaGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.4,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    modalTabs: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 8,
        padding: 4,
    },
    modalTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    modalTabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    closeBtn: {
        padding: 4,
    },
    modalScroll: {
        marginTop: 10,
    },
    tableRowHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 12,
        marginBottom: 12,
    },
    tableCellHeader: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    tableCell: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    modalNote: {
        fontSize: 13,
        color: '#888',
        marginTop: 24,
        lineHeight: 20,
    },
});
