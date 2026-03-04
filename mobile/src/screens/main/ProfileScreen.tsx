import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, RefreshControl, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWishlistStore } from '../../store/wishlistStore';
import { getUserOrders } from '../../lib/getUserOrders';
import { useThemeStore } from '../../store/themeStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

type MenuItemProps = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    sublabel?: string;
    onPress?: () => void;
    danger?: boolean;
    badge?: string | number;
    rightElement?: React.ReactNode;
    isDarkMode: boolean;
};

function MenuItem({ icon, label, sublabel, onPress, danger, badge, rightElement, isDarkMode }: MenuItemProps) {
    const textColor = danger ? '#ef4444' : (isDarkMode ? '#fff' : '#000');
    const sublabelColor = isDarkMode ? '#aaa' : '#999';
    const iconColor = danger ? '#ef4444' : (isDarkMode ? '#fff' : '#000');
    const iconBgColor = danger ? (isDarkMode ? '#3f1111' : '#fee2e2') : (isDarkMode ? '#333' : '#f5f5f5');
    const chevronColor = isDarkMode ? '#555' : '#ccc';
    const badgeBg = isDarkMode ? '#fff' : '#000';
    const badgeText = isDarkMode ? '#000' : '#fff';

    return (
        <TouchableOpacity onPress={onPress} style={styles.menuItem} activeOpacity={0.7} disabled={!onPress && !rightElement}>
            <View style={[styles.menuIconContainer, { backgroundColor: iconBgColor }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.menuTextContainer}>
                <Typography style={[styles.menuLabel, { color: textColor }]}>{label}</Typography>
                {sublabel && <Typography style={[styles.menuSublabel, { color: sublabelColor }]}>{sublabel}</Typography>}
            </View>
            {badge !== undefined && (
                <View style={[styles.menuBadge, { backgroundColor: badgeBg }]}>
                    <Typography style={[styles.menuBadgeText, { color: badgeText }]}>{badge}</Typography>
                </View>
            )}
            {rightElement ? rightElement : (!danger && <Ionicons name="chevron-forward" size={18} color={chevronColor} />)}
        </TouchableOpacity>
    );
}

function Divider({ isDarkMode }: { isDarkMode: boolean }) {
    return <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]} />;
}

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const navigation = useNavigation<any>();
    const wishlistItems = useWishlistStore(s => s.items);
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { isDarkMode, toggleTheme } = useThemeStore();

    const name = (user?.unsafeMetadata?.name as string) || user?.fullName || 'Hype User';
    const email = (user?.unsafeMetadata?.contact_email as string) || user?.primaryEmailAddress?.emailAddress || '';
    const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025';

    const fetchOrderCount = useCallback(async () => {
        if (!user?.id) return;
        try {
            const orders = await getUserOrders(user.id);
            setOrderCount(orders.length);
        } catch {
            setOrderCount(0);
        }
    }, [user?.id]);

    useEffect(() => { fetchOrderCount(); }, [fetchOrderCount]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchOrderCount();
        setIsRefreshing(false);
    }, [fetchOrderCount]);

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
        ]);
    };

    // Dynamic Colors
    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const subtextColor = isDarkMode ? '#ccc' : '#666';
    const faintText = isDarkMode ? '#888' : '#999';
    const faintBorder = isDarkMode ? '#333' : '#f0f0f0';
    const shadowOpacity = isDarkMode ? 0.3 : 0.03;
    const placeholderBg = isDarkMode ? '#333' : '#f5f5f5';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <Typography style={[styles.headerTitle, { color: textColor }]}>Account</Typography>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={textColor}
                        colors={[textColor]}
                    />
                }
            >
                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.circularTextContainer}>
                            {`MEMBER SINCE ${memberSince} • MEMBER SINCE ${memberSince} • `.split('').map((char, index, arr) => {
                                const angle = index * (360 / arr.length);
                                return (
                                    <View key={index} style={[styles.circularCharWrapper, { transform: [{ rotate: `${angle}deg` }] }]}>
                                        <Typography style={[styles.circularChar, { color: isDarkMode ? '#555' : '#a1a1aa' }]}>{char}</Typography>
                                    </View>
                                );
                            })}
                        </View>
                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} resizeMode="cover" />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: placeholderBg }]}>
                                <Ionicons name="person" size={40} color={faintText} />
                            </View>
                        )}
                    </View>
                    <Typography style={[styles.userName, { color: textColor }]}>{name}</Typography>
                    <Typography style={[styles.userEmail, { color: subtextColor }]}>{email}</Typography>

                    {/* Live Stats */}
                    <View style={[styles.statsContainer, { backgroundColor: cardBgColor, shadowOpacity }]}>
                        <View style={[styles.statBox, styles.statBorder, { borderRightColor: faintBorder }]}>
                            <Typography style={[styles.statValue, { color: textColor }]}>
                                {orderCount === null ? '—' : orderCount}
                            </Typography>
                            <Typography style={[styles.statLabel, { color: faintText }]}>Orders</Typography>
                        </View>
                        <View style={styles.statBox}>
                            <Typography style={[styles.statValue, { color: textColor }]}>{wishlistItems.length}</Typography>
                            <Typography style={[styles.statLabel, { color: faintText }]}>Wishlist</Typography>
                        </View>
                    </View>
                </View>

                {/* Shopping */}
                <View style={styles.menuSection}>
                    <Typography style={[styles.sectionHeading, { color: faintText }]}>Shopping</Typography>
                    <View style={[styles.menuCard, { backgroundColor: cardBgColor, shadowOpacity }]}>
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="bag-handle-outline"
                            label="Order History"
                            sublabel="Track, return or repurchase"
                            onPress={() => navigation.navigate('OrderHistory')}
                        />
                        <Divider isDarkMode={isDarkMode} />
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="heart-outline"
                            label="Wishlist"
                            sublabel="Your saved items"
                            onPress={() => navigation.navigate('Favorites')}
                        />
                        <Divider isDarkMode={isDarkMode} />
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="location-outline"
                            label="Shipping Addresses"
                            sublabel="Last used delivery location"
                            onPress={() => navigation.navigate('ShippingAddress')}
                        />
                        <Divider isDarkMode={isDarkMode} />
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="card-outline"
                            label="Payment Methods"
                            sublabel="Secured by 256-bit Encryption"
                            onPress={() => Alert.alert('Payment Methods', 'Your payments are processed through encrypted banking networks. Card details are never stored on our servers.')}
                        />
                    </View>
                </View>

                {/* Settings */}
                <View style={styles.menuSection}>
                    <Typography style={[styles.sectionHeading, { color: faintText }]}>Settings</Typography>
                    <View style={[styles.menuCard, { backgroundColor: cardBgColor, shadowOpacity }]}>
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="moon-outline"
                            label="Dark Mode"
                            rightElement={
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                                />
                            }
                        />
                        <Divider isDarkMode={isDarkMode} />
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="person-outline"
                            label="Personal Details"
                            onPress={() => navigation.navigate('PersonalDetails')}
                        />
                        <Divider isDarkMode={isDarkMode} />
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="notifications-outline"
                            label="Notifications"
                            onPress={() => Alert.alert('Notifications', 'Push notification settings coming soon.')}
                        />
                        <Divider isDarkMode={isDarkMode} />
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="shield-checkmark-outline"
                            label="Privacy & Security"
                            onPress={() => navigation.navigate('PrivacySecurity')}
                        />
                        <Divider isDarkMode={isDarkMode} />
                        <MenuItem
                            isDarkMode={isDarkMode}
                            icon="help-circle-outline"
                            label="Help & Support"
                            onPress={() => Alert.alert('Support', 'Email us at support@hypekart.in')}
                        />
                    </View>
                </View>

                {/* Sign Out */}
                <View style={[styles.menuCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: cardBgColor, shadowOpacity }]}>
                    <MenuItem isDarkMode={isDarkMode} icon="log-out-outline" label="Sign Out" danger onPress={handleSignOut} />
                </View>

                <Typography style={[styles.versionText, { color: isDarkMode ? '#555' : '#ccc' }]}>HypeKart v2.0.0</Typography>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingVertical: 16 },
    headerTitle: { fontSize: 32, fontWeight: '300', letterSpacing: -1 },
    userCard: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, marginBottom: 8 },
    avatarWrapper: { width: 150, height: 150, marginBottom: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    avatarImage: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
    circularTextContainer: { position: 'absolute', width: 140, height: 140, alignItems: 'center', justifyContent: 'center', zIndex: -1 },
    circularCharWrapper: { position: 'absolute', width: 20, height: 140, alignItems: 'center' },
    circularChar: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
    userName: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
    userEmail: { fontSize: 14, marginBottom: 24 },
    statsContainer: { flexDirection: 'row', borderRadius: 20, paddingVertical: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 2 },
    statBox: { flex: 1, alignItems: 'center' },
    statBorder: { borderRightWidth: 1 },
    statValue: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    statLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuSection: { marginTop: 24 },
    sectionHeading: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 28, marginBottom: 12 },
    menuCard: { marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
    menuIconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    menuTextContainer: { flex: 1 },
    menuLabel: { fontSize: 16, fontWeight: '500' },
    menuSublabel: { fontSize: 13, marginTop: 2 },
    menuBadge: { borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7, marginRight: 8 },
    menuBadgeText: { fontSize: 12, fontWeight: '700' },
    divider: { height: 1, marginLeft: 76 },
    versionText: { textAlign: 'center', marginTop: 32, fontSize: 12, letterSpacing: 1 },
});
