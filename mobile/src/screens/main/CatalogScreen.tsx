import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { BlurView } from 'expo-blur';
import { useWishlistStore } from '../../store/wishlistStore';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

export default function CatalogScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const title = route.params?.title || 'Catalog';
    const action = route.params?.action || 'all';

    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toggle, isWishlisted } = useWishlistStore();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#999';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#f5f5f5';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';

    const [activeSubCategory, setActiveSubCategory] = useState('All');
    const [activeItemType, setActiveItemType] = useState('All');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    useEffect(() => {
        setActiveSubCategory('All');
        setActiveItemType('All');
    }, [action, route.params?.categoryName]);

    useEffect(() => {
        fetchProducts();
    }, [action, route.params?.categoryName, activeSubCategory, activeItemType]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('products').select('*');

            let categoryFilter = '';
            const categoryName = route.params?.categoryName;

            // Allow general filtering to apply even if it's Trending/New Arrivals if we want to pass a categoryName through navigation later
            if (categoryName && categoryName !== 'All') {
                categoryFilter = `${categoryName}`;
                if (activeSubCategory !== 'All') {
                    categoryFilter += ` - ${activeSubCategory}`;
                }
                if (categoryName === 'Oversize' && activeSubCategory !== 'All' && activeItemType !== 'All') {
                    categoryFilter += ` - ${activeItemType}`;
                }
            }

            if (action === 'trending') {
                query = query.order('created_at', { ascending: true });
                if (categoryFilter) query = query.ilike('category', `${categoryFilter}%`);
                query = query.limit(50);
            } else if (action === 'new_arrivals') {
                query = query.eq('is_new_arrival', true).order('created_at', { ascending: false });
                if (categoryFilter) query = query.ilike('category', `${categoryFilter}%`);
                query = query.limit(50);
            } else if (action === 'category') {
                if (categoryFilter) {
                    query = query.ilike('category', `${categoryFilter}%`);
                }
                query = query.order('created_at', { ascending: false }).limit(50);
            } else {
                query = query.order('created_at', { ascending: false }).limit(50);
            }

            const { data, error } = await query;
            if (!error && data) {
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPrimaryImage = (images: string[]) => {
        if (images && images.length > 0) return images[0];
        return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop';
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Typography style={[styles.headerTitle, { color: textColor }]}>{title}</Typography>
                    {(action === 'category' || action === 'trending' || action === 'new_arrivals') && route.params?.categoryName && route.params?.categoryName !== 'All' && route.params?.categoryName !== '1' ? (
                        <TouchableOpacity onPress={() => setIsFilterModalVisible(true)} style={styles.backBtn}>
                            <Ionicons name="options-outline" size={24} color={textColor} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 44 }} />
                    )}
                </View>

                {/* Filter Modal */}
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
                                    const mainCat = route.params?.categoryName;

                                    // If no categoryName was passed down (like standard Trending/New Arrivals landing pages), provide general options if they want them...
                                    // Or since the user only wanted it visible when an active category is set, we use the fallback
                                    if (!mainCat || mainCat === 'All' || mainCat === '1') return subCats;

                                    if (mainCat === 'Men' || mainCat === 'Women') subCats = ['All', 'Top', 'Bottoms', 'Footwear', 'Accessories'];
                                    else if (mainCat === 'Kids') subCats = ['All', 'Boy', 'Girl'];
                                    else if (mainCat === 'Oversize') subCats = ['All', 'Men', 'Women'];
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
                            {route.params?.categoryName === 'Oversize' && activeSubCategory !== 'All' && (
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

                {isLoading ? (
                    <ActivityIndicator color={textColor} style={{ flex: 1 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            {products.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.gridCard} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
                                    <View style={[styles.imgWrapper, { backgroundColor: cardBgColor }]}>
                                        <Image source={{ uri: getPrimaryImage(item.images) }} style={styles.img} resizeMode="cover" />
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
                                    <View style={styles.info}>
                                        <Typography style={[styles.brand, { color: subtextColor }]}>{item.brand || 'HYPEKART'}</Typography>
                                        <Typography style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Typography>
                                        <Typography style={[styles.price, { color: textColor }]}>₹{item.base_price?.toLocaleString('en-IN')}</Typography>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
    gridCard: { width: (width - 48) / 2, marginBottom: 24 },
    imgWrapper: { width: '100%', height: 220, borderRadius: 20, backgroundColor: '#f5f5f5', marginBottom: 12, overflow: 'hidden', position: 'relative' },
    img: { width: '100%', height: '100%' },
    heartBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
    info: { paddingHorizontal: 4 },
    brand: { fontSize: 12, color: '#999', fontWeight: '600', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
    itemTitle: { fontSize: 14, color: '#000', fontWeight: '500', marginBottom: 4 },
    price: { fontSize: 16, color: '#000', fontWeight: '700' }
});
