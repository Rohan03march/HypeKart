import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
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

    const [activeGenderFilter, setActiveGenderFilter] = useState('All');

    useEffect(() => {
        fetchProducts();
    }, [action, route.params?.categoryName, activeGenderFilter]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('products').select('*');

            if (action === 'trending') {
                query = query.order('created_at', { ascending: true }).limit(50);
            } else if (action === 'new_arrivals') {
                query = query.eq('is_new_arrival', true).order('created_at', { ascending: false }).limit(50);
            } else if (action === 'category') {
                const categoryName = route.params?.categoryName;
                if (categoryName && categoryName !== 'All') {
                    if ((categoryName === 'Footwear' || categoryName === 'Accessories') && activeGenderFilter !== 'All') {
                        query = query.ilike('category', `${categoryName} - ${activeGenderFilter}%`).order('created_at', { ascending: false }).limit(50);
                    } else {
                        query = query.ilike('category', `${categoryName}%`).order('created_at', { ascending: false }).limit(50);
                    }
                } else {
                    query = query.order('created_at', { ascending: false }).limit(50);
                }
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
                    <View style={{ width: 44 }} />
                </View>

                {action === 'category' && (route.params?.categoryName === 'Footwear' || route.params?.categoryName === 'Accessories') && (
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: borderColor, backgroundColor: cardBgColor }}>
                        {['All', 'Men', 'Women'].map(gender => {
                            const isActive = activeGenderFilter === gender;
                            const borderCol = isActive ? textColor : (isDarkMode ? '#333' : '#e5e5e5');
                            const bgCol = isActive ? textColor : (isDarkMode ? '#1a1a1a' : '#fff');
                            const txtCol = isActive ? bgColor : subtextColor;
                            return (
                                <TouchableOpacity
                                    key={gender}
                                    onPress={() => setActiveGenderFilter(gender)}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: borderCol,
                                        backgroundColor: bgCol,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 70
                                    }}
                                >
                                    <Typography style={{ fontSize: 13, fontWeight: isActive ? '700' : '500', color: txtCol, letterSpacing: 0.5 }}>
                                        {gender}
                                    </Typography>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                )}

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
