import { View, StyleSheet, Animated } from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { useEffect, useRef, useState } from 'react';
import { HomeScreenSkeleton } from '../../components/ui/SkeletonLoader';
import { useThemeStore } from '../../store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const [showSkeleton, setShowSkeleton] = useState(false);

    // Fade values
    const brandOpacity = useRef(new Animated.Value(1)).current;
    const skeletonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Step 1: Show brand for 1s, then fade out
        const step1 = setTimeout(() => {
            Animated.timing(brandOpacity, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }).start(() => {
                // Step 2: Show skeleton
                setShowSkeleton(true);
                Animated.timing(skeletonOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, 900);

        // Step 3: Finish after 2.4s total
        const step3 = setTimeout(() => {
            onFinish();
        }, 2400);

        return () => {
            clearTimeout(step1);
            clearTimeout(step3);
        };
    }, [onFinish]);

    const bg = isDarkMode ? '#121212' : '#fafafa';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Brand intro */}
            {!showSkeleton && (
                <Animated.View style={[styles.brandContainer, { opacity: brandOpacity, backgroundColor: bg }]}>
                    <Typography variant="h1" weight="bold" style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                        HYPEKART
                    </Typography>
                    <Typography variant="caption" style={[styles.subtitle, { color: isDarkMode ? '#666' : '#9ca3af' }]}>
                        Premium Essentials
                    </Typography>
                </Animated.View>
            )}

            {/* Skeleton layout */}
            {showSkeleton && (
                <Animated.View style={{ flex: 1, opacity: skeletonOpacity }}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <HomeScreenSkeleton />
                    </SafeAreaView>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    brandContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    subtitle: {
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
