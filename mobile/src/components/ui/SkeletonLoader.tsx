import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, Dimensions } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

interface SkeletonBoxProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function SkeletonBox({ width: w = '100%', height = 16, borderRadius = 8, style }: SkeletonBoxProps) {
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const shimmer = useRef(new Animated.Value(0)).current;

    const baseColor = isDarkMode ? '#2a2a2a' : '#e0e0e0';
    const highlightColor = isDarkMode ? '#3d3d3d' : '#f0f0f0';

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 850, useNativeDriver: false }),
                Animated.timing(shimmer, { toValue: 0, duration: 850, useNativeDriver: false }),
            ])
        ).start();
        return () => shimmer.stopAnimation();
    }, [shimmer]);

    const backgroundColor = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [baseColor, highlightColor],
    });

    return (
        <Animated.View style={[{ width: w as any, height, borderRadius, backgroundColor }, style]} />
    );
}

// --- Home Screen Skeleton ---
export function HomeScreenSkeleton() {
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const bg = isDarkMode ? '#121212' : '#fafafa';
    const cardW = (width - 48 - 16) / 2;

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
                <View style={{ gap: 8 }}>
                    <SkeletonBox width={120} height={20} borderRadius={6} />
                    <SkeletonBox width={180} height={12} borderRadius={4} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <SkeletonBox width={44} height={44} borderRadius={22} />
                    <SkeletonBox width={44} height={44} borderRadius={22} />
                </View>
            </View>

            {/* Hero Banner */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                <SkeletonBox width={'100%'} height={360} borderRadius={24} />
            </View>

            {/* Category Pills */}
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 32 }}>
                {[80, 55, 70, 55, 80].map((w, i) => (
                    <SkeletonBox key={i} width={w} height={36} borderRadius={18} />
                ))}
            </View>

            {/* New Arrivals Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
                <SkeletonBox width={140} height={20} borderRadius={6} />
                <SkeletonBox width={50} height={14} borderRadius={4} />
            </View>

            {/* New Arrivals Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 24 }}>
                {[1, 2, 3, 4].map((_, i) => (
                    <View key={i} style={{ width: cardW }}>
                        <SkeletonBox width={cardW} height={190} borderRadius={20} style={{ marginBottom: 10 }} />
                        <SkeletonBox width={cardW * 0.55} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
                        <SkeletonBox width={cardW * 0.8} height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                        <SkeletonBox width={cardW * 0.4} height={16} borderRadius={4} />
                    </View>
                ))}
            </View>
        </View>
    );
}

// --- Catalog Screen Skeleton ---
export function CatalogScreenSkeleton() {
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const bg = isDarkMode ? '#121212' : '#fafafa';
    const border = isDarkMode ? '#333' : '#f0f0f0';
    const cardW = (width - 48) / 2;

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: border }}>
                <SkeletonBox width={44} height={44} borderRadius={22} />
                <SkeletonBox width={140} height={20} borderRadius={6} />
                <SkeletonBox width={44} height={44} borderRadius={22} />
            </View>

            {/* Grid */}
            <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
                    {[1, 2, 3, 4, 5, 6].map((_, i) => (
                        <View key={i} style={{ width: cardW, marginBottom: 8 }}>
                            <SkeletonBox width={cardW} height={220} borderRadius={20} style={{ marginBottom: 10 }} />
                            <SkeletonBox width={cardW * 0.5} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
                            <SkeletonBox width={cardW * 0.8} height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                            <SkeletonBox width={cardW * 0.4} height={16} borderRadius={4} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// --- Cart Screen Skeleton ---
export function CartScreenSkeleton() {
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const bg = isDarkMode ? '#121212' : '#fafafa';
    const cardBg = isDarkMode ? '#1e1e1e' : '#fff';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SkeletonBox width={160} height={30} borderRadius={8} />
                <SkeletonBox width={60} height={16} borderRadius={6} />
            </View>

            {/* Shipping banner */}
            <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
                <View style={{ backgroundColor: cardBg, padding: 16, borderRadius: 16 }}>
                    <SkeletonBox width={'70%'} height={13} borderRadius={4} style={{ marginBottom: 10, alignSelf: 'center' }} />
                    <SkeletonBox width={'100%'} height={4} borderRadius={2} />
                </View>
            </View>

            {/* Cart Items */}
            <View style={{ paddingHorizontal: 24 }}>
                {[1, 2, 3].map((_, i) => (
                    <View key={i} style={{ flexDirection: 'row', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#222' : '#f0f0f0' }}>
                        <SkeletonBox width={100} height={120} borderRadius={12} />
                        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'space-between' }}>
                            <View style={{ gap: 8 }}>
                                <SkeletonBox width={'80%'} height={16} borderRadius={4} />
                                <SkeletonBox width={'55%'} height={13} borderRadius={4} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <SkeletonBox width={80} height={18} borderRadius={4} />
                                <SkeletonBox width={100} height={36} borderRadius={20} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Order Summary */}
            <View style={{ margin: 24, padding: 24, backgroundColor: cardBg, borderRadius: 24, gap: 16 }}>
                <SkeletonBox width={140} height={18} borderRadius={6} />
                {[1, 2, 3].map((_, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <SkeletonBox width={100} height={14} borderRadius={4} />
                        <SkeletonBox width={70} height={14} borderRadius={4} />
                    </View>
                ))}
                <View style={{ height: 1, backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SkeletonBox width={60} height={18} borderRadius={4} />
                    <SkeletonBox width={100} height={24} borderRadius={4} />
                </View>
            </View>
        </View>
    );
}

// --- Wishlist Screen Skeleton ---
export function WishlistScreenSkeleton() {
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const bg = isDarkMode ? '#121212' : '#fafafa';
    const cardBg = isDarkMode ? '#1e1e1e' : '#fff';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SkeletonBox width={120} height={30} borderRadius={8} />
                <SkeletonBox width={50} height={16} borderRadius={6} />
            </View>

            {/* Wishlist Cards */}
            <View style={{ padding: 24, gap: 20 }}>
                {[1, 2, 3, 4].map((_, i) => (
                    <View key={i} style={{ flexDirection: 'row', backgroundColor: cardBg, borderRadius: 20, padding: 12 }}>
                        <SkeletonBox width={110} height={130} borderRadius={12} />
                        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 4 }}>
                            <View style={{ gap: 8 }}>
                                <SkeletonBox width={'45%'} height={11} borderRadius={4} />
                                <SkeletonBox width={'80%'} height={16} borderRadius={4} />
                                <SkeletonBox width={'65%'} height={14} borderRadius={4} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <SkeletonBox width={90} height={20} borderRadius={4} />
                                <SkeletonBox width={40} height={40} borderRadius={20} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// --- Profile Screen Skeleton ---
export function ProfileScreenSkeleton() {
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const bg = isDarkMode ? '#121212' : '#fafafa';
    const cardBg = isDarkMode ? '#1e1e1e' : '#fff';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
                <SkeletonBox width={120} height={30} borderRadius={8} />
            </View>

            {/* Avatar + Name */}
            <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, gap: 12 }}>
                <SkeletonBox width={100} height={100} borderRadius={50} />
                <SkeletonBox width={160} height={22} borderRadius={6} />
                <SkeletonBox width={200} height={14} borderRadius={4} />

                {/* Stats card */}
                <View style={{ flexDirection: 'row', backgroundColor: cardBg, borderRadius: 20, paddingVertical: 20, width: '100%', marginTop: 12 }}>
                    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                        <SkeletonBox width={40} height={22} borderRadius={6} />
                        <SkeletonBox width={60} height={12} borderRadius={4} />
                    </View>
                    <View style={{ width: 1, backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }} />
                    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                        <SkeletonBox width={40} height={22} borderRadius={6} />
                        <SkeletonBox width={60} height={12} borderRadius={4} />
                    </View>
                </View>
            </View>

            {/* Menu Sections */}
            {[4, 5].map((count, si) => (
                <View key={si} style={{ marginTop: si === 0 ? 8 : 24 }}>
                    <SkeletonBox width={80} height={12} borderRadius={4} style={{ marginLeft: 28, marginBottom: 12 }} />
                    <View style={{ marginHorizontal: 20, backgroundColor: cardBg, borderRadius: 24, padding: 4 }}>
                        {Array.from({ length: count }).map((_, i) => (
                            <View key={i}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, gap: 16 }}>
                                    <SkeletonBox width={40} height={40} borderRadius={20} />
                                    <View style={{ flex: 1, gap: 6 }}>
                                        <SkeletonBox width={'55%'} height={15} borderRadius={4} />
                                        <SkeletonBox width={'75%'} height={12} borderRadius={4} />
                                    </View>
                                    <SkeletonBox width={18} height={18} borderRadius={4} />
                                </View>
                                {i < count - 1 && <View style={{ height: 1, backgroundColor: isDarkMode ? '#333' : '#f5f5f5', marginLeft: 76 }} />}
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}
