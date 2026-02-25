import React, { useState, useRef } from 'react';
import { View, Dimensions, ScrollView, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Elevated\nStreetwear.',
        description: 'Curated apparel from the worlds most exclusive brands.',
        image: require('../../../assets/images/welcome_slide_1.png'),
    },
    {
        id: '2',
        title: 'The Modern\nWardrobe.',
        description: 'Discover limited capsules and luxury streetwear essentials.',
        image: require('../../../assets/images/welcome_slide_2.png'),
    },
    {
        id: '3',
        title: 'Seamless\nAccess.',
        description: 'Your gateway to high-end drops, right at your fingertips.',
        image: require('../../../assets/images/welcome_slide_3.png'),
    },
];

export default function WelcomeScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const navigation = useNavigation<any>();
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
        } else {
            navigation.navigate('Login');
        }
    };

    const handleSkip = () => {
        navigation.navigate('Login');
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event: any) => {
                const slideSize = event.nativeEvent.layoutMeasurement.width;
                const index = event.nativeEvent.contentOffset.x / slideSize;
                setActiveIndex(Math.round(index));
            }
        }
    );

    return (
        <View style={styles.container}>
            {/* Background Image / Blur rendering behind everything */}
            <View style={StyleSheet.absoluteFill}>
                <Animated.Image
                    source={SLIDES[activeIndex].image}
                    style={[styles.bgImage, { opacity: 0.8 }]}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Typography style={styles.brandText}>HYPEKART</Typography>
                    <TouchableOpacity onPress={handleSkip}>
                        <Typography style={styles.skipText}>Skip</Typography>
                    </TouchableOpacity>
                </View>

                <Animated.ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                >
                    {SLIDES.map((slide, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const translateY = scrollX.interpolate({
                            inputRange,
                            outputRange: [50, 0, 50],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0, 1, 0],
                            extrapolate: 'clamp',
                        });

                        return (
                            <View key={slide.id} style={styles.slide}>
                                <Animated.View style={[styles.textContainer, { transform: [{ translateY }], opacity }]}>
                                    <View style={styles.glassBadge}>
                                        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                                        <Typography style={styles.badgeText}>Chapter 0{i + 1}</Typography>
                                    </View>
                                    <Typography style={styles.titleText}>{slide.title}</Typography>
                                    <Typography style={styles.descText}>{slide.description}</Typography>
                                </Animated.View>
                            </View>
                        );
                    })}
                </Animated.ScrollView>

                <View style={styles.footer}>
                    <View style={styles.pagination}>
                        {SLIDES.map((_, i) => {
                            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                            const dotWidth = scrollX.interpolate({
                                inputRange,
                                outputRange: [8, 24, 8],
                                extrapolate: 'clamp',
                            });
                            const dotOpacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });
                            return (
                                <Animated.View
                                    key={i}
                                    style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
                                />
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#ffffff', '#e2e2e2']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Typography style={styles.buttonText}>
                                {activeIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
                            </Typography>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingTop: 16,
    },
    brandText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 3,
    },
    skipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '500',
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 28,
        paddingBottom: 40,
    },
    textContainer: {
        width: '100%',
    },
    glassBadge: {
        alignSelf: 'flex-start',
        borderRadius: 20,
        overflow: 'hidden',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    titleText: {
        fontSize: 48,
        fontWeight: '300',
        color: '#ffffff',
        lineHeight: 52,
        marginBottom: 16,
        letterSpacing: -1,
    },
    descText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 24,
        fontWeight: '400',
        maxWidth: '90%',
    },
    footer: {
        paddingHorizontal: 28,
        paddingBottom: 48,
        paddingTop: 20,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        marginLeft: 4,
    },
    dot: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ffffff',
        marginRight: 8,
    },
    primaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        shadowColor: '#fff',
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
        color: '#000000',
        letterSpacing: 0.5,
    }
});
