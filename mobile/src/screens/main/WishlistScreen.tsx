import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore } from '../../store/wishlistStore';
import { useThemeStore } from '../../store/themeStore';

export default function WishlistScreen() {
    const navigation = useNavigation<any>();
    const { items, removeItem } = useWishlistStore();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const imgBgColor = isDarkMode ? '#333' : '#f5f5f5';
    const removeBg = isDarkMode ? '#3a1a1a' : '#fff5f5';

    if (items.length === 0) {
        return (
            <SafeAreaView style={[styles.emptyContainer, { backgroundColor: bgColor }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: cardBgColor }]}>
                    <Ionicons name="heart-outline" size={48} color={textColor} />
                </View>
                <Typography style={[styles.emptyTitle, { color: textColor }]}>No saved items</Typography>
                <Typography style={[styles.emptySubtitle, { color: subtextColor }]}>
                    Curate your personal collection. Tap the heart icon on any product to save it here.
                </Typography>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.primaryButton}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#000000', '#1a1a1a']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Typography style={styles.buttonText}>Explore Collections</Typography>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: bgColor }]}>
                <Typography style={[styles.headerTitle, { color: textColor }]}>Wishlist</Typography>
                <Typography style={[styles.headerSubtitle, { color: subtextColor }]}>{items.length} items</Typography>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ padding: 24, gap: 20 }}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.wishlistCard, { backgroundColor: cardBgColor }]}
                        activeOpacity={0.85}
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
                    >
                        <View style={[styles.imageContainer, { backgroundColor: imgBgColor }]}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.itemImage}
                                resizeMode="cover"
                            />
                        </View>

                        <View style={styles.itemDetails}>
                            <View>
                                <Typography style={[styles.brandText, { color: subtextColor }]}>{item.brand}</Typography>
                                <Typography style={[styles.titleText, { color: textColor }]} numberOfLines={2}>{item.title}</Typography>
                            </View>

                            <View style={styles.priceRow}>
                                <Typography style={[styles.priceText, { color: textColor }]}>₹{item.price.toLocaleString('en-IN')}</Typography>
                                <TouchableOpacity
                                    onPress={() => removeItem(item.id)}
                                    style={[styles.removeBtn, { backgroundColor: removeBg }]}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="heart" size={20} color="#ff4b4b" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa'
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
    primaryButton: {
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
    wishlistCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    imageContainer: {
        width: 110,
        height: 130,
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
        paddingVertical: 4,
        justifyContent: 'space-between',
    },
    brandText: {
        fontSize: 11,
        color: '#999',
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    titleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        lineHeight: 22,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    removeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff5f5',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
