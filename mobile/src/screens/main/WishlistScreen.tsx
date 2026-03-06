import React, { useState, useEffect } from 'react';
import {
    View, FlatList, TouchableOpacity, Image, StyleSheet,
    Dimensions, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore } from '../../store/wishlistStore';
import { useThemeStore } from '../../store/themeStore';
import { WishlistScreenSkeleton } from '../../components/ui/SkeletonLoader';
import { useCartStore } from '../../store/cartStore';

const { width } = Dimensions.get('window');

function WishlistCard({ item, isDarkMode, onRemove, onAddToCart, onPress }: any) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handleHeartPress = () => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1.5, useNativeDriver: true, speed: 60 }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60 }),
        ]).start(() => onRemove());
    };

    const cardBg = isDarkMode ? '#1a1a1a' : '#fff';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#999' : '#888';
    const imgBg = isDarkMode ? '#2a2a2a' : '#f3f3f3';
    const borderColor = isDarkMode ? '#2a2a2a' : '#f0f0f0';

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg, borderColor }]}
            activeOpacity={0.92}
            onPress={onPress}
        >
            {/* Product Image — left side, tall and vivid */}
            <View style={[styles.imageWrap, { backgroundColor: imgBg }]}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                {/* Gradient shine at bottom of image */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.18)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 0, y: 1 }}
                    pointerEvents="none"
                />
            </View>

            {/* Right side details */}
            <View style={styles.details}>
                {/* Brand + Heart */}
                <View style={styles.topRow}>
                    <Typography style={[styles.brand, { color: subtextColor }]} numberOfLines={1}>
                        {item.brand?.toUpperCase()}
                    </Typography>
                    <TouchableOpacity onPress={handleHeartPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Ionicons name="heart" size={20} color="#ff3b5c" />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Typography style={[styles.title, { color: textColor }]} numberOfLines={3}>
                    {item.title}
                </Typography>

                {/* Price */}
                <Typography style={[styles.price, { color: textColor }]}>
                    ₹{item.price.toLocaleString('en-IN')}
                </Typography>

                {/* Add to Bag button */}
                <TouchableOpacity
                    style={[styles.addBtn, { borderColor: isDarkMode ? '#444' : '#e0e0e0' }]}
                    activeOpacity={0.8}
                    onPress={(e) => { e.stopPropagation?.(); onAddToCart(); }}
                >
                    <LinearGradient
                        colors={isDarkMode ? ['#fff', '#f0f0f0'] : ['#000', '#1a1a1a']}
                        style={styles.addBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="bag-add-outline" size={13} color={isDarkMode ? '#000' : '#fff'} />
                        <Typography style={[styles.addBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>
                            Add to Bag
                        </Typography>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

export default function WishlistScreen() {
    const navigation = useNavigation<any>();
    const { items, removeItem } = useWishlistStore();
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const addToCart = useCartStore(s => s.addItem);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsInitialLoading(false), 700);
        return () => clearTimeout(t);
    }, []);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';

    if (isInitialLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
                <WishlistScreenSkeleton />
            </SafeAreaView>
        );
    }

    if (items.length === 0) {
        return (
            <SafeAreaView style={[styles.emptyContainer, { backgroundColor: bgColor }]}>
                <View style={[styles.emptyIconOuter, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
                    <LinearGradient
                        colors={['#ff6b6b22', '#ff3b5c11']}
                        style={styles.emptyIconInner}
                    >
                        <Ionicons name="heart-outline" size={48} color="#ff3b5c" />
                    </LinearGradient>
                </View>
                <Typography style={[styles.emptyTitle, { color: textColor }]}>
                    Your wishlist is empty
                </Typography>
                <Typography style={[styles.emptySubtitle, { color: subtextColor }]}>
                    Tap the ♡ on any product to save it here. Come back any time to add them to your bag.
                </Typography>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton} activeOpacity={0.8}>
                    <LinearGradient colors={['#000', '#1a1a1a']} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Typography style={styles.buttonText}>Explore Collections</Typography>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDarkMode ? '#222' : '#f0f0f0' }]}>
                <View>
                    <Typography style={[styles.headerTitle, { color: textColor }]}>Wishlist</Typography>
                    <Typography style={[styles.headerCount, { color: subtextColor }]}>
                        {items.length} saved {items.length === 1 ? 'item' : 'items'}
                    </Typography>
                </View>
                <View style={[styles.heartPill, { backgroundColor: isDarkMode ? '#2a1a1a' : '#fff0f2' }]}>
                    <Ionicons name="heart" size={14} color="#ff3b5c" />
                    <Typography style={styles.heartPillText}>{items.length}</Typography>
                </View>
            </View>

            {/* List */}
            <FlatList
                key="single-col"
                data={items}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}
                renderItem={({ item }) => (
                    <WishlistCard
                        item={item}
                        isDarkMode={isDarkMode}
                        onPress={() => navigation.navigate('ProductDetails', {
                            product: {
                                id: item.id,
                                title: item.title,
                                brand: item.brand,
                                base_price: item.price,
                                images: item.images ?? [item.image],
                                description: item.description,
                                sizes: item.sizes,
                                colors: item.colors,
                            }
                        })}
                        onRemove={() => removeItem(item.id)}
                        onAddToCart={() => {
                            addToCart({
                                productId: item.id,
                                name: item.title,
                                price: item.price,
                                image: item.image,
                                size: item.sizes?.[0] || 'One Size',
                                color: item.colors?.[0] || 'Default',
                                quantity: 1,
                            });
                            navigation.navigate('Cart');
                        }}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: '300',
        letterSpacing: -1,
    },
    headerCount: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    heartPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    heartPillText: {
        color: '#ff3b5c',
        fontWeight: '700',
        fontSize: 13,
    },

    // Card
    card: {
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    imageWrap: {
        width: 130,
        height: 160,
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    details: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brand: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 4,
    },
    price: {
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: -0.3,
        marginTop: 4,
    },
    addBtn: {
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
    },
    addBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 5,
    },
    addBtnText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIconOuter: {
        width: 110,
        height: 110,
        borderRadius: 55,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        shadowColor: '#ff3b5c',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 6,
    },
    emptyIconInner: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 26,
        fontWeight: '300',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
        paddingHorizontal: 16,
    },
    primaryButton: {
        width: 220,
        height: 54,
        borderRadius: 27,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonGradient: {
        flex: 1,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
});
