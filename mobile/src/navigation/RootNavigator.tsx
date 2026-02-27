import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Platform, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../components/ui/Typography';
import { useCartStore } from '../store/cartStore';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProductDetailsScreen from '../screens/main/ProductDetailsScreen';
import CartScreen from '../screens/main/CartScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import OrderSuccessScreen from '../screens/main/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/main/OrderHistoryScreen';
import ShippingAddressScreen from '../screens/main/ShippingAddressScreen';
import PersonalDetailsScreen from '../screens/main/PersonalDetailsScreen';
import PrivacySecurityScreen from '../screens/main/PrivacySecurityScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type TabName = 'Home' | 'Cart' | 'Favorites' | 'Profile';

const TAB_ICONS: Record<TabName, { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Cart: { active: 'cart', inactive: 'cart-outline' },
    Favorites: { active: 'heart', inactive: 'heart-outline' },
    Profile: { active: 'person', inactive: 'person-outline' },
};

function CustomTabBar({ state, navigation }: any) {
    const getCartCount = useCartStore(s => s.getCartCount);
    const cartCount = getCartCount();

    // Dynamic width calculation for the sliding indicator
    const tabWidth = (width - 48 - 16) / state.routes.length; // 48 is container padding, 16 is inner padding
    const translateX = useSharedValue(0);

    // Animate the active pill background
    React.useEffect(() => {
        translateX.value = withSpring(state.index * tabWidth, {
            damping: 18,
            stiffness: 150,
            mass: 0.8,
        });
    }, [state.index, tabWidth]);

    const activeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={styles.floatingContainer}>
            <View style={styles.tabBarInner}>
                <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

                {/* The sliding active background */}
                <Animated.View style={[styles.activeBackground, { width: tabWidth }, activeStyle]} />

                <View style={styles.tabBarContent}>
                    {state.routes.map((route: any, index: number) => {
                        const isFocused = state.index === index;
                        const name = route.name as TabName;
                        const iconName = isFocused ? TAB_ICONS[name].active : TAB_ICONS[name].inactive;

                        const onPress = () => {
                            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                activeOpacity={1}
                                style={styles.tabButton}
                            >
                                <View style={styles.iconWrapper}>
                                    <Ionicons
                                        name={iconName}
                                        size={22}
                                        color={isFocused ? '#000000' : '#8e9094'}
                                    />
                                    {name === 'Cart' && cartCount > 0 && (
                                        <View style={styles.cartBadge}>
                                            <Typography style={styles.cartBadgeText}>
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </Typography>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

// Bottom Tabs Navigator
function MainTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Cart" component={CartScreen} />
            <Tab.Screen name="Favorites" component={WishlistScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const [showSplash, setShowSplash] = useState(true);

    if (!isLoaded || showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    // Check if user has already completed onboarding
    const onboardingCompleted = user?.unsafeMetadata?.onboarding_completed === true;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isSignedIn ? (
                <Stack.Group>
                    {!onboardingCompleted && (
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    )}
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen
                        name="ProductDetails"
                        component={ProductDetailsScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen name="Checkout" component={CheckoutScreen} />
                    <Stack.Screen
                        name="OrderSuccess"
                        component={OrderSuccessScreen}
                        options={{ gestureEnabled: false }}
                    />
                    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                    <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
                    <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
                    <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                </Stack.Group>
            ) : (
                <Stack.Group>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                </Stack.Group>
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    floatingContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 34 : 24,
        left: 24,
        right: 24,
        height: 64,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    tabBarInner: {
        flex: 1,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        position: 'relative', // for absolute active bg
    },
    tabBarContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    activeBackground: {
        position: 'absolute',
        top: 8,
        left: 8,
        bottom: 8,
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#000',
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 7,
        fontWeight: '800',
        lineHeight: 9,
    }
});
