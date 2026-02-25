import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, StyleSheet } from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const MOCK_PRODUCT = {
    id: 'prod_123',
    name: 'Essential Layering Hoodie',
    brand: 'HYPEKART STUDIOS',
    price: 85.00,
    rating: 4.8,
    reviewCount: 214,
    description: 'Crafted from heavyweight 400gsm organic cotton fleece. Designed for maximum comfort with drop shoulders and a double-lined hood. An elevated take on an everyday essential.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
        { name: 'Onyx', hex: '#1a1a1a' },
        { name: 'Heather', hex: '#9ca3af' },
        { name: 'Bone', hex: '#e5e7eb' },
        { name: 'Sage', hex: '#657b6f' },
    ],
};

export default function ProductDetailsScreen() {
    const navigation = useNavigation<any>();
    const addItem = useCartStore(state => state.addItem);
    const [selectedSize, setSelectedSize] = useState(MOCK_PRODUCT.sizes[2]);
    const [selectedColor, setSelectedColor] = useState(MOCK_PRODUCT.colors[0]);
    const [added, setAdded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const handleAddToCart = () => {
        addItem({
            productId: MOCK_PRODUCT.id,
            name: MOCK_PRODUCT.name,
            price: MOCK_PRODUCT.price,
            image: MOCK_PRODUCT.image,
            size: selectedSize,
            color: selectedColor.name,
            quantity: 1,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        navigation.navigate('MainTabs' as never, { screen: 'Cart' } as never);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Full bleed image hero */}
                <View style={styles.imageHero}>
                    <Image source={{ uri: MOCK_PRODUCT.image }} style={styles.mainImage} resizeMode="cover" />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(250,250,250,1)']}
                        locations={[0, 0.3, 1]}
                        style={StyleSheet.absoluteFillObject}
                    />

                    {/* Header Controls */}
                    <View style={styles.headerControls}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                            <Ionicons name="arrow-back" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.iconButton}>
                            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#ff4b4b" : "#fff"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.brandBadge}>
                        <Typography style={styles.brandText}>{MOCK_PRODUCT.brand}</Typography>
                    </View>

                    <Typography style={styles.productName}>{MOCK_PRODUCT.name}</Typography>

                    <View style={styles.priceRow}>
                        <Typography style={styles.productPrice}>${MOCK_PRODUCT.price}</Typography>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                            <Typography style={styles.ratingText}>{MOCK_PRODUCT.rating} ({MOCK_PRODUCT.reviewCount})</Typography>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Color Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Typography style={styles.sectionTitle}>Color</Typography>
                            <Typography style={styles.selectionLabel}>{selectedColor.name}</Typography>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                            {MOCK_PRODUCT.colors.map(col => {
                                const isActive = selectedColor.name === col.name;
                                return (
                                    <TouchableOpacity
                                        key={col.name}
                                        onPress={() => setSelectedColor(col)}
                                        style={[styles.colorOuterRing, isActive && styles.colorOuterRingActive]}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.colorCircle, { backgroundColor: col.hex }]} />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Size Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Typography style={styles.sectionTitle}>Size</Typography>
                            <TouchableOpacity>
                                <Typography style={styles.guideLink}>Size Guide</Typography>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeScroll}>
                            {MOCK_PRODUCT.sizes.map(size => {
                                const isActive = selectedSize === size;
                                return (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => setSelectedSize(size)}
                                        style={[styles.sizeBox, isActive && styles.sizeBoxActive]}
                                        activeOpacity={0.8}
                                    >
                                        <Typography style={[styles.sizeText, isActive && styles.sizeTextActive]}>{size}</Typography>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Details */}
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>Details</Typography>
                        <Typography style={styles.descriptionText}>{MOCK_PRODUCT.description}</Typography>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Floating CTA */}
            <View style={styles.bottomCtaContainer}>
                <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                    onPress={handleAddToCart}
                    style={styles.primaryButton}
                    activeOpacity={0.9}
                    disabled={added}
                >
                    <LinearGradient
                        colors={added ? ['#4ade80', '#22c55e'] : ['#000000', '#1a1a1a']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {added ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Typography style={styles.buttonText}>Added to Bag</Typography>
                            </View>
                        ) : (
                            <Typography style={styles.buttonText}>Add to Bag  •  ${MOCK_PRODUCT.price}</Typography>
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
        backgroundColor: '#fafafa'
    },
    imageHero: {
        width,
        height: width * 1.3,
        position: 'relative'
    },
    mainImage: {
        width: '100%',
        height: '100%'
    },
    headerControls: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    brandBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignSelf: 'flex-start',
        borderRadius: 12,
        marginBottom: 12
    },
    brandText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    productName: {
        fontSize: 32,
        fontWeight: '400',
        color: '#000',
        letterSpacing: -1,
        lineHeight: 38,
        marginBottom: 16
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    productPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000'
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000'
    },
    divider: {
        height: 1,
        backgroundColor: '#eaeaea',
        marginBottom: 32
    },
    section: {
        marginBottom: 32
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000'
    },
    selectionLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500'
    },
    guideLink: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        textDecorationLine: 'underline'
    },
    colorScroll: {
        gap: 16,
        paddingRight: 24
    },
    colorOuterRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    colorOuterRingActive: {
        borderColor: '#000'
    },
    colorCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    sizeScroll: {
        gap: 12,
        paddingRight: 24
    },
    sizeBox: {
        height: 48,
        minWidth: 48,
        paddingHorizontal: 16,
        borderRadius: 24,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eaeaea',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    sizeBoxActive: {
        backgroundColor: '#000',
        borderColor: '#000'
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666'
    },
    sizeTextActive: {
        color: '#fff',
        fontWeight: '600'
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
        marginTop: 12
    },
    bottomCtaContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(250,250,250,0.8)'
    },
    primaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
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
        letterSpacing: 0.5
    }
});
