import React, { useState } from 'react';
import {
    View, ScrollView, TouchableOpacity, Image,
    Dimensions, StyleSheet, StatusBar
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
    const productDescription: string = product?.description ?? 'No description available.';
    const productImages: string[] = (product?.images && product.images.length > 0)
        ? product.images
        : [FALLBACK_IMAGE];

    const sizeOptions: string[] = product?.sizes ?? ['S', 'M', 'L', 'XL'];
    const colorOptions: string[] = product?.colors ?? ['#1a1a1a', '#9ca3af', '#e5e7eb'];

    const [activeImage, setActiveImage] = useState(productImages[0]);
    const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [added, setAdded] = useState(false);
    const { toggle, isWishlisted } = useWishlistStore();
    const isFavorite = isWishlisted(productId);
    const insets = useSafeAreaInsets();

    const handleAddToCart = () => {
        addItem({
            productId,
            name: productName,
            price: productPrice,
            image: productImages[0],
            size: selectedSize,
            color: selectedColor,
            quantity: 1,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        navigation.navigate('MainTabs' as never, { screen: 'Cart' } as never);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

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

                {/* Main Image */}
                <View style={styles.mainImageContainer}>
                    <Image source={{ uri: activeImage }} style={styles.mainImage} resizeMode="cover" />



                    {/* Brand pill overlay */}
                    <View style={styles.brandOverlay}>
                        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
                        <Typography style={styles.brandOverlayText}>{productBrand}</Typography>
                    </View>
                </View>

                {/* Thumbnail strip — only shown when multiple images */}
                {productImages.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.thumbnailScroll}
                        contentContainerStyle={styles.thumbnailContent}
                    >
                        {productImages.map((img, i) => {
                            const isActive = img === activeImage;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setActiveImage(img)}
                                    style={[styles.thumbnailWrap, isActive && styles.thumbnailWrapActive]}
                                    activeOpacity={0.8}
                                >
                                    <Image source={{ uri: img }} style={styles.thumbnail} resizeMode="cover" />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Product Info */}
                <View style={styles.content}>

                    {/* Name */}
                    <Typography style={styles.productName} numberOfLines={2}>
                        {productName}
                    </Typography>

                    {/* Price below name */}
                    <View style={styles.priceRow}>
                        <Typography style={styles.priceText}>₹{productPrice.toLocaleString('en-IN')}</Typography>
                    </View>

                    <View style={styles.divider} />

                    {/* Color Selection */}
                    {colorOptions.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Typography style={styles.sectionLabel}>COLOR</Typography>
                                <Typography style={styles.sectionValue}>{selectedColor}</Typography>
                            </View>
                            <View style={styles.colorRow}>
                                {colorOptions.map((color) => {
                                    const isActive = selectedColor === color;
                                    return (
                                        <TouchableOpacity
                                            key={color}
                                            onPress={() => setSelectedColor(color)}
                                            style={[styles.colorRing, isActive && styles.colorRingActive]}
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
                                <TouchableOpacity>
                                    <Typography style={styles.guideLink}>Size Guide →</Typography>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeRow}>
                                {sizeOptions.map((size) => {
                                    const isActive = selectedSize === size;
                                    return (
                                        <TouchableOpacity
                                            key={size}
                                            onPress={() => setSelectedSize(size)}
                                            style={[styles.sizeChip, isActive && styles.sizeChipActive]}
                                            activeOpacity={0.8}
                                        >
                                            <Typography style={[styles.sizeText, isActive && styles.sizeTextActive]}>
                                                {size}
                                            </Typography>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* Description */}
                    <View style={styles.section}>
                        <Typography style={styles.sectionLabel}>DETAILS</Typography>
                        <Typography style={styles.descriptionText}>{productDescription}</Typography>
                    </View>

                </View>
            </ScrollView>

            {/* Floating CTA */}
            <View style={styles.cta}>
                <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                    onPress={handleAddToCart}
                    style={styles.ctaButton}
                    activeOpacity={0.9}
                    disabled={added}
                >
                    <LinearGradient
                        colors={added ? ['#16a34a', '#15803d'] : ['#000', '#1a1a1a']}
                        style={styles.ctaGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {added ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Typography style={styles.ctaText}>Added to Bag</Typography>
                            </View>
                        ) : (
                            <Typography style={styles.ctaText}>Add to Bag  ·  ₹{productPrice.toLocaleString('en-IN')}</Typography>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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

    // Thumbnails
    thumbnailScroll: {
        marginTop: 12,
    },
    thumbnailContent: {
        paddingHorizontal: 16,
        gap: 10,
    },
    thumbnailWrap: {
        width: 68,
        height: 68,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '#f3f3f3',
    },
    thumbnailWrapActive: {
        borderColor: '#000',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },

    // Content
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
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
        marginBottom: 20,
    },
    priceText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        letterSpacing: -0.3,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 24,
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
});
