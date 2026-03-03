import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '../../lib/supabase';
import { useWishlistStore } from '../../store/wishlistStore';
import * as Location from 'expo-location';
import { useAddressStore } from '../../store/addressStore';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', name: 'All' },
    { id: '2', name: 'Men' },
    { id: '3', name: 'Women' },
    { id: '4', name: 'Apparel' },
    { id: '5', name: 'Footwear' },
    { id: '6', name: 'Accessories' },
];
export default function HomeScreen() {
    const { user } = useUser();
    const navigation = useNavigation<any>();
    const [activeCategory, setActiveCategory] = useState('1');
    const { toggle, isWishlisted } = useWishlistStore();

    // Supabase Data States
    const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
    const [newArrivals, setNewArrivals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Search States
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const searchInputRef = useRef<TextInput>(null);

    const { addresses, selectedAddressId, addAddress } = useAddressStore();
    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    useEffect(() => {
        checkLocation();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                fetchSearchResults(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchSearchResults = async (query: string) => {
        setIsSearchLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .ilike('title', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                setSearchResults(data);
            }
        } catch (error) {
            console.error("Error searching products:", error);
        } finally {
            setIsSearchLoading(false);
        }
    };

    const checkLocation = async () => {
        if (addresses.length > 0) return; // Only fetch if no addresses exist

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            });

            try {
                // OpenStreetMap Nominatim API (No Key Required)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}&zoom=18&addressdetails=1`, {
                    headers: {
                        'User-Agent': 'HypeKartApp/1.0'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.address) {
                        const addr = data.address;
                        const addrFull = data.display_name;

                        addAddress({
                            id: Date.now().toString(),
                            full_name: user?.fullName || 'My Name',
                            phone: '',
                            address: addrFull,
                            city: addr.city || addr.town || addr.village || '',
                            state: addr.state || '',
                            pincode: addr.postcode || '',
                            is_current_location: true
                        });
                        return; // Successfully used OpenStreetMap, exit early
                    }
                }
            } catch (e) {
                console.error("OpenStreetMap Geocoding failed, falling back to Expo...", e);
            }

            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                const addressParts = [
                    addr.name,
                    addr.streetNumber,
                    addr.street,
                    addr.district,
                    addr.subregion,
                ].filter(Boolean);

                const newAddress = {
                    id: Date.now().toString(),
                    full_name: user?.fullName || 'My Name',
                    phone: '',
                    address: addressParts.join(', '),
                    city: addr.city || addr.subregion || addr.region || '',
                    state: addr.region || '',
                    pincode: addr.postalCode || '',
                    is_current_location: true
                };
                addAddress(newAddress);
            }
        } catch (error) {
            console.error("Error getting location:", error);
        }
    };

    const fetchProducts = async (isRefresh = false) => {
        if (isRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        try {
            const selectedCat = CATEGORIES.find(c => c.id === activeCategory);
            const isAll = !selectedCat || selectedCat.id === '1';

            // Fetch Trending
            let trendingQuery = supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(6);

            if (!isAll) {
                trendingQuery = trendingQuery.eq('category', selectedCat.name);
            }

            const { data: trendingData, error: trendingError } = await trendingQuery;

            if (!trendingError && trendingData) {
                setTrendingProducts(trendingData);
            }

            // Fetch New Drops
            let newQuery = supabase
                .from('products')
                .select('*')
                .eq('is_new_arrival', true)
                .order('created_at', { ascending: false })
                .limit(4);

            if (!isAll) {
                newQuery = newQuery.eq('category', selectedCat.name);
            }
            const { data: newData, error: newError } = await newQuery;

            if (!newError && newData) {
                setNewArrivals(newData);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };


    const getPrimaryImage = (images: string[]) => {
        if (images && images.length > 0) return images[0];
        return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop';
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>

                <View style={styles.header}>
                    {isSearching ? (
                        <View style={styles.searchHeaderContainer}>
                            <View style={styles.searchInputContainer}>
                                <Ionicons name="search" size={18} color="#666" style={{ marginLeft: 12 }} />
                                <TextInput
                                    ref={searchInputRef}
                                    style={styles.searchInput}
                                    placeholder="Search products..."
                                    placeholderTextColor="#999"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                                        <Ionicons name="close-circle" size={18} color="#ccc" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsSearching(false);
                                    setSearchQuery('');
                                }}
                                style={styles.cancelSearchBtn}
                            >
                                <Typography style={{ fontWeight: '600', color: '#000' }}>Cancel</Typography>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={{ flex: 1, paddingRight: 16 }}>
                                <Typography style={styles.logoText}>HYPEKART</Typography>
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
                                    onPress={() => navigation.navigate('ShippingAddress')}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="location" size={12} color="#666" />
                                    <Typography style={{ fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500', flexShrink: 1 }} numberOfLines={1}>
                                        {selectedAddress ? selectedAddress.address : 'Select Delivery Address'}
                                    </Typography>
                                    <Ionicons name="chevron-down" size={12} color="#666" style={{ marginLeft: 2 }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setIsSearching(true)}
                                    style={styles.iconBtn}
                                >
                                    <Ionicons name="search-outline" size={20} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('Favorites')} style={styles.iconBtn}>
                                    <Ionicons name="heart-outline" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => fetchProducts(true)}
                            tintColor="#000"
                            colors={['#000']}
                        />
                    }
                    keyboardShouldPersistTaps="handled"
                >

                    {isSearching ? (
                        <View style={{ flex: 1, minHeight: 400 }}>
                            {searchQuery.trim() === '' ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Ionicons name="search" size={48} color="#ddd" />
                                    <Typography style={{ color: '#999', marginTop: 16, fontSize: 16 }}>Search for sneakers, apparel...</Typography>
                                </View>
                            ) : isSearchLoading ? (
                                <ActivityIndicator color="#000" style={{ marginTop: 40 }} />
                            ) : searchResults.length === 0 ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Typography style={{ color: '#000', fontSize: 18, fontWeight: '600' }}>No results found</Typography>
                                    <Typography style={{ color: '#999', marginTop: 8, textAlign: 'center' }}>We couldn't find anything matching "{searchQuery}"</Typography>
                                </View>
                            ) : (
                                <View style={[styles.newGrid, { paddingTop: 16 }]}>
                                    {searchResults.map((item) => (
                                        <TouchableOpacity key={item.id} style={styles.newGridCard} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
                                            <View style={styles.newGridImgWrapper}>
                                                <Image source={{ uri: getPrimaryImage(item.images) }} style={styles.productImg} resizeMode="cover" />
                                            </View>
                                            <View style={styles.newGridInfo}>
                                                <Typography style={styles.newGridTitle} numberOfLines={1}>{item.title}</Typography>
                                                <Typography style={styles.productPrice}>₹{item.base_price?.toLocaleString('en-IN')}</Typography>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : (
                        <>
                            {/* Hero Banner */}
                            <View style={styles.heroContainer}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop' }}
                                    style={StyleSheet.absoluteFillObject}
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    style={StyleSheet.absoluteFillObject}
                                />
                                <View style={styles.heroContent}>
                                    <View style={styles.heroTag}>
                                        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
                                        <Typography style={styles.heroTagText}>NEW CAPSULE</Typography>
                                    </View>
                                    <Typography style={styles.heroTitle}>Summer '25</Typography>
                                    <Typography style={styles.heroSubtitle}>Explore the latest curated essentials.</Typography>
                                </View>
                            </View>

                            {/* Categories */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.categoriesScroll}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {CATEGORIES.map((cat) => {
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => setActiveCategory(cat.id)}
                                            style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                                        >
                                            <Typography style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                                {cat.name}
                                            </Typography>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Trending Now */}
                            <View style={styles.sectionHeader}>
                                <Typography style={styles.sectionTitle}>Trending</Typography>
                                <TouchableOpacity onPress={() => navigation.navigate('Catalog', { title: 'Trending', action: 'trending' })}>
                                    <Typography style={styles.seeAllText}>See all</Typography>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                                contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 40, gap: 16 }}
                                snapToInterval={200}
                                decelerationRate="fast"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#000" style={{ marginTop: 40, marginLeft: width / 2 - 40 }} />
                                ) : trendingProducts.map((prod) => (
                                    <TouchableOpacity key={prod.id} style={styles.productCard} onPress={() => navigation.navigate('ProductDetails', { product: prod })}>
                                        <View style={styles.productImgWrapper}>
                                            <Image source={{ uri: getPrimaryImage(prod.images) }} style={styles.productImg} resizeMode="cover" />
                                            <View style={styles.productImgOverlay} />
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    toggle({
                                                        id: prod.id,
                                                        title: prod.title,
                                                        brand: prod.brand || 'HYPEKART',
                                                        price: prod.base_price,
                                                        image: getPrimaryImage(prod.images),
                                                        images: prod.images,
                                                        description: prod.description,
                                                        sizes: prod.sizes,
                                                        colors: prod.colors,
                                                    });
                                                }}
                                                style={styles.heartBtn}
                                            >
                                                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                                                <Ionicons
                                                    name={isWishlisted(prod.id) ? 'heart' : 'heart-outline'}
                                                    size={18}
                                                    color={isWishlisted(prod.id) ? '#ff4b4b' : '#fff'}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <Typography style={styles.productBrand}>{prod.brand || 'HYPEKART'}</Typography>
                                        <Typography style={styles.productTitle} numberOfLines={1}>{prod.title}</Typography>
                                        <Typography style={styles.productPrice}>₹{prod.base_price?.toLocaleString('en-IN')}</Typography>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* New Arrivals Grid */}
                            <View style={styles.sectionHeader}>
                                <Typography style={styles.sectionTitle}>New Arrivals</Typography>
                                <TouchableOpacity onPress={() => navigation.navigate('Catalog', { title: 'New Arrivals', action: 'new_arrivals' })}>
                                    <Typography style={styles.seeAllText}>See all</Typography>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.newGrid}>
                                {isLoading ? (
                                    <ActivityIndicator color="#000" style={{ marginTop: 20, alignSelf: 'center', flex: 1 }} />
                                ) : newArrivals.map((item) => (
                                    <TouchableOpacity key={item.id} style={styles.newGridCard} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
                                        <View style={styles.newGridImgWrapper}>
                                            <Image source={{ uri: getPrimaryImage(item.images) }} style={styles.productImg} resizeMode="cover" />
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    toggle({
                                                        id: item.id,
                                                        title: item.title,
                                                        brand: item.brand || 'HYPEKART',
                                                        price: item.base_price,
                                                        image: getPrimaryImage(item.images),
                                                        images: item.images,
                                                        description: item.description,
                                                        sizes: item.sizes,
                                                        colors: item.colors,
                                                    });
                                                }}
                                                style={styles.heartBtn}
                                            >
                                                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                                                <Ionicons
                                                    name={isWishlisted(item.id) ? 'heart' : 'heart-outline'}
                                                    size={18}
                                                    color={isWishlisted(item.id) ? '#ff4b4b' : '#fff'}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.newGridInfo}>
                                            <Typography style={styles.newGridTitle} numberOfLines={1}>{item.title}</Typography>
                                            <Typography style={styles.productPrice}>₹{item.base_price?.toLocaleString('en-IN')}</Typography>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 20,
    },
    searchHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: 100,
        height: 44,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        fontSize: 15,
        color: '#000',
    },
    cancelSearchBtn: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 1,
        color: '#000',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroContainer: {
        marginHorizontal: 24,
        marginBottom: 32,
        height: 400,
        borderRadius: 32,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    heroContent: {
        padding: 32,
    },
    heroTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    heroTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '300',
        letterSpacing: -1,
        marginBottom: 8,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '400',
    },
    categoriesScroll: {
        marginBottom: 36,
    },
    categoriesContainer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    categoryPill: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    categoryPillActive: {
        backgroundColor: '#000',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        letterSpacing: 0.5,
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        letterSpacing: -0.5,
    },
    seeAllText: {
        color: '#666',
        fontWeight: '500',
        fontSize: 14,
    },
    horizontalScroll: {
        marginBottom: 48,
    },
    productCard: {
        width: 184,
    },
    productImgWrapper: {
        width: '100%',
        height: 240,
        borderRadius: 24,
        backgroundColor: '#f5f5f5',
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    productImg: {
        width: '100%',
        height: '100%',
    },
    productImgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    heartBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    productBrand: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    productTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        color: '#000',
        fontWeight: '700',
    },
    newGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        gap: 16,
    },
    newGridCard: {
        width: (width - 64) / 2,
        marginBottom: 24,
    },
    newGridImgWrapper: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginBottom: 12,
        overflow: 'hidden',
    },
    newGridInfo: {
        paddingHorizontal: 4,
    },
    newGridTitle: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
        marginBottom: 4,
    }
});
