import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator, RefreshControl, TextInput, FlatList, Modal } from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
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
import { useCacheStore } from '../../store/cacheStore';
import { useThemeStore } from '../../store/themeStore';

const getPrimaryImage = (images: string[]) => {
    if (images && images.length > 0) return images[0];
    return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop';
};

const ProductCard = memo(({ prod, onPress, onToggleWishlist, isWishlisted, isDarkMode }: any) => {
    const textColor = isDarkMode ? '#fff' : '#000';
    const subTextColor = isDarkMode ? '#aaa' : '#999';
    const imgBgColor = isDarkMode ? '#1e1e1e' : '#f5f5f5';

    return (
        <TouchableOpacity style={styles.productCard} onPress={onPress}>
            <View style={[styles.productImgWrapper, { backgroundColor: imgBgColor }]}>
                <Image
                    source={{ uri: getPrimaryImage(prod.images) }}
                    style={styles.productImg}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
                <View style={styles.productImgOverlay} />
                <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); onToggleWishlist(prod); }}
                    style={styles.heartBtn}
                >
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <Ionicons name={isWishlisted ? "heart" : "heart-outline"} color={isWishlisted ? "#ef4444" : "#fff"} size={20} />
                </TouchableOpacity>
            </View>
            <Typography style={[styles.productBrand, { color: subTextColor }]}>{prod.brand || 'HYPEKART'}</Typography>
            <Typography style={[styles.productTitle, { color: textColor }]} numberOfLines={1}>{prod.title}</Typography>
            <Typography style={[styles.productPrice, { color: textColor }]}>₹{Number(prod.base_price).toLocaleString('en-IN')}</Typography>
        </TouchableOpacity>
    );
});

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', name: 'All' },
    { id: '2', name: 'Men' },
    { id: '3', name: 'Women' },
    { id: '4', name: 'Kids' },
    { id: '5', name: 'Oversize' },
];

const CAROUSEL_DATA = [
    {
        id: '1',
        title: 'Complete Collection',
        subtitle: 'Explore the full HypeKart catalog.',
        tag: 'SHOP ALL',
        image: require('../../../assets/banners/banner1.png'),
        categoryId: '1'
    },
    {
        id: '2',
        title: 'Menswear',
        subtitle: 'Premium streetwear & contemporary fits.',
        tag: 'MENS',
        image: require('../../../assets/banners/carousel_men.png'),
        categoryId: '2'
    },
    {
        id: '3',
        title: 'Womenswear',
        subtitle: 'Trendy elegant casual wear.',
        tag: 'WOMENS',
        image: require('../../../assets/banners/carousel_women.png'),
        categoryId: '3'
    },
    {
        id: '4',
        title: 'Kids Collection',
        subtitle: 'Playful & stylish streetwear.',
        tag: 'KIDS',
        image: require('../../../assets/banners/carousel_kids.png'),
        categoryId: '4'
    },
    {
        id: '5',
        title: 'Oversize Fit',
        subtitle: 'Premium heavyweight baggy style.',
        tag: 'OVERSIZE',
        image: require('../../../assets/banners/carousel_oversize.png'),
        categoryId: '5'
    }
];

export default function HomeScreen() {
    const { user } = useUser();
    const navigation = useNavigation<any>();
    const [activeCategory, setActiveCategory] = useState('1');
    const { toggle, isWishlisted } = useWishlistStore();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    // Supabase Data States
    const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
    const [newArrivals, setNewArrivals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeSubCategory, setActiveSubCategory] = useState('All');
    const [activeItemType, setActiveItemType] = useState('All');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    // Search States
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const searchInputRef = useRef<TextInput>(null);

    const { addresses, selectedAddressId, addAddress } = useAddressStore();
    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
    const { getProducts, setProducts } = useCacheStore();

    useEffect(() => {
        setActiveSubCategory('All');
        setActiveItemType('All');
        fetchProducts();
    }, [activeCategory]);

    useEffect(() => {
        fetchProducts();
    }, [activeSubCategory, activeItemType]);

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
            const cached = getProducts(activeCategory);
            if (cached) {
                // Assuming we stored an object combining both trending and newArrivals previously
                // Let's modify caching to be robust. 
                // We will cache a single payload: { trendingData, newData } under activeCategory
                setTrendingProducts(cached[0]);
                setNewArrivals(cached[1]);
                setIsLoading(false);
                return;
            }
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
                let categoryFilter = `${selectedCat.name}`;
                if (activeSubCategory !== 'All') {
                    categoryFilter += ` - ${activeSubCategory}`;
                }
                if (selectedCat.name === 'Oversize' && activeSubCategory !== 'All' && activeItemType !== 'All') {
                    categoryFilter += ` - ${activeItemType}`;
                }

                trendingQuery = trendingQuery.ilike('category', `${categoryFilter}%`);
            }
            const { data: trendingData, error: trendingError } = await trendingQuery;

            // Fetch New Drops
            let newQuery = supabase
                .from('products')
                .select('*')
                .eq('is_new_arrival', true)
                .order('created_at', { ascending: false })
                .limit(4);

            if (!isAll) {
                let categoryFilter = `${selectedCat.name}`;
                if (activeSubCategory !== 'All') {
                    categoryFilter += ` - ${activeSubCategory}`;
                }
                if (selectedCat.name === 'Oversize' && activeSubCategory !== 'All' && activeItemType !== 'All') {
                    categoryFilter += ` - ${activeItemType}`;
                }

                newQuery = newQuery.ilike('category', `${categoryFilter}%`);
            }
            const { data: newData, error: newError } = await newQuery;

            if (!trendingError && trendingData) setTrendingProducts(trendingData);
            if (!newError && newData) setNewArrivals(newData);

            if (!trendingError && !newError) {
                setProducts(activeCategory, [trendingData || [], newData || []]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const [activeIndex, setActiveIndex] = useState(0);

    const handleToggleWishlist = useCallback((prod: any) => {
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
    }, [toggle]);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const searchBg = isDarkMode ? '#1e1e1e' : '#f1f1f1';
    const placeholderColor = isDarkMode ? '#666' : '#999';
    const iconBg = isDarkMode ? '#333' : '#f5f5f5';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <SafeAreaView style={{ flex: 1 }}>

                <View style={styles.header}>
                    {isSearching ? (
                        <View style={styles.searchHeaderContainer}>
                            <View style={[styles.searchInputContainer, { backgroundColor: searchBg }]}>
                                <Ionicons name="search" size={18} color={subtextColor} style={{ marginLeft: 12 }} />
                                <TextInput
                                    ref={searchInputRef}
                                    style={[styles.searchInput, { color: textColor }]}
                                    placeholder="Search products..."
                                    placeholderTextColor={placeholderColor}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                    keyboardAppearance={isDarkMode ? 'dark' : 'light'}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                                        <Ionicons name="close-circle" size={18} color={placeholderColor} />
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
                                <Typography style={{ fontWeight: '600', color: textColor }}>Cancel</Typography>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={{ flex: 1, paddingRight: 16, overflow: 'hidden' }}>
                                <Typography style={[styles.logoText, { color: textColor }]}>HYPEKART</Typography>
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, width: '100%' }}
                                    onPress={() => navigation.navigate('ShippingAddress')}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="location" size={12} color={subtextColor} />
                                    <Typography style={{ fontSize: 12, color: subtextColor, marginLeft: 4, fontWeight: '500', flexShrink: 1 }} numberOfLines={1}>
                                        {selectedAddress ? selectedAddress.address : 'Select Delivery Address'}
                                    </Typography>
                                    <Ionicons name="chevron-down" size={12} color={subtextColor} style={{ marginLeft: 2 }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setIsSearching(true)}
                                    style={[styles.iconBtn, { backgroundColor: iconBg }]}
                                >
                                    <Ionicons name="search-outline" size={20} color={textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('Favorites')} style={[styles.iconBtn, { backgroundColor: iconBg }]}>
                                    <Ionicons name="heart-outline" size={20} color={textColor} />
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
                                    <Ionicons name="search" size={48} color={isDarkMode ? '#333' : '#ddd'} />
                                    <Typography style={{ color: placeholderColor, marginTop: 16, fontSize: 16 }}>Search for sneakers, streetwear...</Typography>
                                </View>
                            ) : isSearchLoading ? (
                                <ActivityIndicator color={textColor} style={{ marginTop: 40 }} />
                            ) : searchResults.length === 0 ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Typography style={{ color: textColor, fontSize: 18, fontWeight: '600' }}>No results found</Typography>
                                    <Typography style={{ color: placeholderColor, marginTop: 8, textAlign: 'center' }}>We couldn't find anything matching "{searchQuery}"</Typography>
                                </View>
                            ) : (
                                <View style={[styles.newGrid, { paddingTop: 16 }]}>
                                    {searchResults.map((item) => (
                                        <TouchableOpacity key={item.id} style={styles.newGridCard} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
                                            <View style={[styles.newGridImgWrapper, { backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5' }]}>
                                                <Image source={{ uri: getPrimaryImage(item.images) }} style={styles.productImg} resizeMode="cover" />
                                            </View>
                                            <View style={styles.newGridInfo}>
                                                <Typography style={[styles.newGridTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Typography>
                                                <Typography style={[styles.productPrice, { color: textColor }]}>₹{item.base_price?.toLocaleString('en-IN')}</Typography>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : (
                        <>
                            {/* Hero Banner Carousel */}
                            <View style={styles.heroContainer}>
                                <Carousel
                                    loop
                                    width={width - 48}
                                    height={400}
                                    autoPlay={!isSearching}
                                    autoPlayInterval={3500}
                                    data={CAROUSEL_DATA}
                                    scrollAnimationDuration={1000}
                                    onSnapToItem={(index) => setActiveIndex(index)}
                                    mode="parallax"
                                    modeConfig={{
                                        parallaxScrollingScale: 0.9,
                                        parallaxScrollingOffset: 50,
                                    }}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={styles.heroOuterCard}
                                            onPress={() => {
                                                const cat = CATEGORIES.find(c => c.id === item.categoryId);
                                                if (cat) {
                                                    navigation.navigate('Catalog', { title: item.title, action: 'category', categoryName: cat.name });
                                                }
                                            }}
                                        >
                                            <Image
                                                source={item.image}
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
                                                    <Typography style={styles.heroTagText}>{item.tag}</Typography>
                                                </View>
                                                <Typography style={styles.heroTitle} numberOfLines={1}>{item.title}</Typography>
                                                <Typography style={styles.heroSubtitle}>{item.subtitle}</Typography>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>

                            {/* Categories */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={[styles.categoriesScroll, { marginBottom: activeCategory !== '1' ? 16 : 36 }]}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {CATEGORIES.map((cat) => {
                                    const isActive = activeCategory === cat.id;
                                    const pillBg = isActive ? textColor : (isDarkMode ? '#1e1e1e' : '#fff');
                                    const pillBorder = isActive ? textColor : (isDarkMode ? '#333' : '#f0f0f0');
                                    const textCol = isActive ? bgColor : (isDarkMode ? '#aaa' : '#666');

                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => setActiveCategory(cat.id)}
                                            style={[styles.categoryPill, { backgroundColor: pillBg, borderColor: pillBorder }, isActive && styles.categoryPillActive]}
                                        >
                                            <Typography style={[styles.categoryText, { color: textCol }, isActive && styles.categoryTextActive]}>
                                                {cat.name}
                                            </Typography>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>



                            {/* SubCategory Modal */}
                            <Modal visible={isFilterModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsFilterModalVisible(false)}>
                                <TouchableOpacity
                                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }}
                                    activeOpacity={1}
                                    onPress={() => setIsFilterModalVisible(false)}
                                >
                                    <View style={{ backgroundColor: bgColor, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }} onStartShouldSetResponder={() => true}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                            <Typography style={{ fontSize: 20, fontWeight: '700', color: textColor }}>Filters</Typography>
                                            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                                                <Ionicons name="close" size={24} color={textColor} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* SubCategory Selection */}
                                        <Typography style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 12 }}>Subcategory</Typography>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                                            {(() => {
                                                let subCats: string[] = [];
                                                if (activeCategory === '2' || activeCategory === '3') subCats = ['All', 'Top', 'Bottoms', 'Footwear', 'Accessories'];
                                                else if (activeCategory === '4') subCats = ['All', 'Boy', 'Girl'];
                                                else if (activeCategory === '5') subCats = ['All', 'Men', 'Women'];
                                                return subCats;
                                            })().map(subCat => {
                                                const isActive = activeSubCategory === subCat;
                                                const borderCol = isActive ? textColor : (isDarkMode ? '#333' : '#e5e5e5');
                                                const bgCol = isActive ? textColor : (isDarkMode ? '#1a1a1a' : '#fff');
                                                const txtCol = isActive ? bgColor : subtextColor;
                                                return (
                                                    <TouchableOpacity
                                                        key={subCat}
                                                        onPress={() => {
                                                            setActiveSubCategory(subCat);
                                                            setActiveItemType('All');
                                                        }}
                                                        style={{
                                                            paddingHorizontal: 20,
                                                            paddingVertical: 10,
                                                            borderRadius: 20,
                                                            borderWidth: 1,
                                                            borderColor: borderCol,
                                                            backgroundColor: bgCol,
                                                        }}
                                                    >
                                                        <Typography style={{ fontSize: 14, fontWeight: isActive ? '700' : '500', color: txtCol }}>
                                                            {subCat}
                                                        </Typography>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </View>

                                        {/* ItemType Selection for Oversize */}
                                        {activeCategory === '5' && activeSubCategory !== 'All' && (
                                            <>
                                                <Typography style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 12 }}>Type</Typography>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                                                    {['All', 'Top', 'Bottoms', 'Footwear', 'Accessories'].map(item => {
                                                        const isActive = activeItemType === item;
                                                        const borderCol = isActive ? textColor : (isDarkMode ? '#333' : '#e5e5e5');
                                                        const bgCol = isActive ? textColor : (isDarkMode ? '#1a1a1a' : '#fff');
                                                        const txtCol = isActive ? bgColor : subtextColor;
                                                        return (
                                                            <TouchableOpacity
                                                                key={item}
                                                                onPress={() => setActiveItemType(item)}
                                                                style={{
                                                                    paddingHorizontal: 20,
                                                                    paddingVertical: 10,
                                                                    borderRadius: 20,
                                                                    borderWidth: 1,
                                                                    borderColor: borderCol,
                                                                    backgroundColor: bgCol,
                                                                }}
                                                            >
                                                                <Typography style={{ fontSize: 14, fontWeight: isActive ? '700' : '500', color: txtCol }}>
                                                                    {item}
                                                                </Typography>
                                                            </TouchableOpacity>
                                                        )
                                                    })}
                                                </View>
                                            </>
                                        )}

                                        {/* Apply Button */}
                                        <TouchableOpacity
                                            onPress={() => setIsFilterModalVisible(false)}
                                            style={{ backgroundColor: textColor, paddingVertical: 16, borderRadius: 100, alignItems: 'center', marginTop: 8 }}
                                        >
                                            <Typography style={{ color: bgColor, fontWeight: '700', fontSize: 16 }}>Show results</Typography>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </Modal>



                            {/* Trending Now */}
                            <View style={styles.sectionHeader}>
                                <Typography style={[styles.sectionTitle, { color: textColor }]}>Trending</Typography>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    {activeCategory !== '1' && (
                                        <TouchableOpacity onPress={() => setIsFilterModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="options-outline" size={20} color={textColor} />
                                            {(activeSubCategory !== 'All' || activeItemType !== 'All') && (
                                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: textColor, marginLeft: 2, marginTop: -8 }} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={() => navigation.navigate('Catalog', { title: 'Trending', action: 'trending' })}>
                                        <Typography style={[styles.seeAllText, { color: subtextColor }]}>See all</Typography>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {isLoading ? (
                                <ActivityIndicator color={textColor} style={{ marginTop: 40, marginLeft: width / 2 - 40 }} />
                            ) : (
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.horizontalScroll}
                                    data={trendingProducts}
                                    keyExtractor={item => item.id}
                                    contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 40, gap: 16 }}
                                    snapToInterval={216}
                                    decelerationRate="fast"
                                    initialNumToRender={3}
                                    maxToRenderPerBatch={3}
                                    windowSize={5}
                                    removeClippedSubviews={true}
                                    renderItem={({ item: prod }) => (
                                        <ProductCard
                                            prod={prod}
                                            onPress={() => navigation.navigate('ProductDetails', { product: prod })}
                                            onToggleWishlist={handleToggleWishlist}
                                            isWishlisted={isWishlisted(prod.id)}
                                            isDarkMode={isDarkMode}
                                        />
                                    )}
                                />
                            )}

                            {/* New Arrivals Grid */}
                            <View style={styles.sectionHeader}>
                                <Typography style={[styles.sectionTitle, { color: textColor }]}>New Arrivals</Typography>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    {activeCategory !== '1' && (
                                        <TouchableOpacity onPress={() => setIsFilterModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="options-outline" size={20} color={textColor} />
                                            {(activeSubCategory !== 'All' || activeItemType !== 'All') && (
                                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: textColor, marginLeft: 2, marginTop: -8 }} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={() => navigation.navigate('Catalog', { title: 'New Arrivals', action: 'new_arrivals' })}>
                                        <Typography style={[styles.seeAllText, { color: subtextColor }]}>See all</Typography>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.newGrid}>
                                {isLoading ? (
                                    <ActivityIndicator color={textColor} style={{ marginTop: 20, alignSelf: 'center', flex: 1 }} />
                                ) : newArrivals.map((item) => (
                                    <TouchableOpacity key={item.id} style={styles.newGridCard} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
                                        <View style={[styles.newGridImgWrapper, { backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5' }]}>
                                            <Image
                                                source={{ uri: getPrimaryImage(item.images) }}
                                                style={styles.productImg}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                            />
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
                                            <Typography style={[styles.newGridTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Typography>
                                            <Typography style={[styles.productPrice, { color: textColor }]}>₹{item.base_price?.toLocaleString('en-IN')}</Typography>
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
        flex: 1,
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
        position: 'relative',
    },
    heroOuterCard: {
        width: '100%',
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 32,
        paddingBottom: 48, // space for dots
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 24,
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
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    categoryPillActive: {
        backgroundColor: '#000',
        borderColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 0.5,
    },
    categoryTextActive: {
        color: '#fff',
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
