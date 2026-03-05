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
import CatalogScreen from '../screens/main/CatalogScreen';
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
import PaymentMethodsScreen from '../screens/main/PaymentMethodsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type TabName = 'Home' | 'Cart' | 'Favorites' | 'Profile';

const TAB_ICONS: Record<TabName, { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Cart: { active: 'cart', inactive: 'cart-outline' },
    Favorites: { active: 'heart', inactive: 'heart-outline' },
    Profile: { active: 'person', inactive: 'person-outline' },
};

import { useThemeStore } from '../store/themeStore';

function CustomTabBar({ state, navigation, descriptors }: any) {
    const cartCount = useCartStore(s => s.items.reduce((total, item) => total + item.quantity, 0));
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    // All hooks must be called before any early return (Rules of Hooks)
    const tabWidth = (width - 48 - 16) / state.routes.length;
    const translateX = useSharedValue(0);

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

    // Hide tab bar for screens that opt out (e.g. Cart) — AFTER all hooks
    const activeRoute = state.routes[state.index];
    const activeDescriptor = descriptors[activeRoute.key];
    const tabBarStyle = activeDescriptor?.options?.tabBarStyle;
    if (tabBarStyle && (tabBarStyle as any).display === 'none') return null;

    // Theme Colors
    const blurTint = isDarkMode ? "dark" : "light";
    const barBgColor = isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)';
    const barBorderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)';
    const activeBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const iconActiveColor = isDarkMode ? '#fff' : '#000000';
    const iconInactiveColor = isDarkMode ? '#666' : '#8e9094';
    const badgeBg = isDarkMode ? '#fff' : '#000';
    const badgeBorder = isDarkMode ? '#000' : '#fff';
    const badgeText = isDarkMode ? '#000' : 'white';

    return (
        <View style={styles.floatingContainer}>
            <View style={[styles.tabBarInner, { backgroundColor: barBgColor, borderColor: barBorderColor }]}>
                <BlurView intensity={70} tint={blurTint} style={StyleSheet.absoluteFill} />

                {/* The sliding active background */}
                <Animated.View style={[styles.activeBackground, { width: tabWidth, backgroundColor: activeBgColor }, activeStyle]} />

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
                                        color={isFocused ? iconActiveColor : iconInactiveColor}
                                    />
                                    {name === 'Cart' && cartCount > 0 && (
                                        <View style={[styles.cartBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                                            <Typography style={[styles.cartBadgeText, { color: badgeText }]}>
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
            <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarStyle: { display: 'none' } }} />
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
                    <Stack.Screen name="Catalog" component={CatalogScreen} />
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
                    <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
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
