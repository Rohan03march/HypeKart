import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

type MenuItemProps = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    sublabel?: string;
    onPress?: () => void;
    danger?: boolean;
};

function MenuItem({ icon, label, sublabel, onPress, danger }: MenuItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.menuItem}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconContainer, danger && { backgroundColor: '#fee2e2' }]}>
                <Ionicons name={icon} size={20} color={danger ? '#ef4444' : '#000'} />
            </View>
            <View style={styles.menuTextContainer}>
                <Typography style={[styles.menuLabel, danger && { color: '#ef4444' }]}>{label}</Typography>
                {sublabel && <Typography style={styles.menuSublabel}>{sublabel}</Typography>}
            </View>
            {!danger && <Ionicons name="chevron-forward" size={18} color="#ccc" />}
        </TouchableOpacity>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const navigation = useNavigation<any>();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
        ]);
    };

    const name = (user?.unsafeMetadata?.name as string) || user?.fullName || 'Hype User';
    const email = user?.primaryEmailAddress?.emailAddress || '';
    const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Typography style={styles.headerTitle}>Account</Typography>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerCartBtn}>
                    <Ionicons name="bag-handle-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.userCard}>
                    <View style={styles.avatarWrapper}>
                        {/* Circular Text implementation */}
                        <View style={styles.circularTextContainer}>
                            {`MEMBER SINCE ${memberSince} • MEMBER SINCE ${memberSince} • `.split('').map((char, index, arr) => {
                                const angle = index * (360 / arr.length);
                                return (
                                    <View key={index} style={[styles.circularCharWrapper, { transform: [{ rotate: `${angle}deg` }] }]}>
                                        <Typography style={styles.circularChar}>{char}</Typography>
                                    </View>
                                );
                            })}
                        </View>

                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={40} color="#ccc" />
                            </View>
                        )}
                    </View>

                    <Typography style={styles.userName}>{name}</Typography>
                    <Typography style={styles.userEmail}>{email}</Typography>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        {[
                            { label: 'Orders', value: '12' },
                            { label: 'Wishlist', value: '4' },
                        ].map((stat, i, arr) => (
                            <View key={stat.label} style={[styles.statBox, i < arr.length - 1 && styles.statBorder]}>
                                <Typography style={styles.statValue}>{stat.value}</Typography>
                                <Typography style={styles.statLabel}>{stat.label}</Typography>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Navigation Menus */}
                <View style={styles.menuSection}>
                    <Typography style={styles.sectionHeading}>Shopping</Typography>
                    <View style={styles.menuCard}>
                        <MenuItem icon="bag-handle-outline" label="Order History" sublabel="Track, return or repurchase" />
                        <Divider />
                        <MenuItem icon="heart-outline" label="Wishlist" sublabel="Your saved items" />
                        <Divider />
                        <MenuItem icon="location-outline" label="Shipping Addresses" sublabel="Manage delivery locations" />
                        <Divider />
                        <MenuItem icon="card-outline" label="Payment Methods" sublabel="Manage your cards" />
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Typography style={styles.sectionHeading}>Settings</Typography>
                    <View style={styles.menuCard}>
                        <MenuItem icon="person-outline" label="Personal Details" />
                        <Divider />
                        <MenuItem icon="notifications-outline" label="Notifications" />
                        <Divider />
                        <MenuItem icon="shield-checkmark-outline" label="Privacy & Security" />
                        <Divider />
                        <MenuItem icon="help-circle-outline" label="Help & Support" />
                    </View>
                </View>

                {/* Sign Out */}
                <View style={[styles.menuCard, { marginHorizontal: 20, marginTop: 12 }]}>
                    <MenuItem icon="log-out-outline" label="Sign Out" danger onPress={handleSignOut} />
                </View>

                <Typography style={styles.versionText}>HypeKart v2.0.0</Typography>
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
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '300',
        color: '#000',
        letterSpacing: -1
    },
    headerCartBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userCard: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    avatarWrapper: {
        width: 150,
        height: 150,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circularTextContainer: {
        position: 'absolute',
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    circularCharWrapper: {
        position: 'absolute',
        width: 20,
        height: 140,
        alignItems: 'center',
    },
    circularChar: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        color: '#a1a1aa',
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuSection: {
        marginTop: 24,
    },
    sectionHeading: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 28,
        marginBottom: 12,
    },
    menuCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    menuSublabel: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f5f5f5',
        marginLeft: 76, // Align with text
    },
    versionText: {
        textAlign: 'center',
        marginTop: 32,
        fontSize: 12,
        color: '#ccc',
        letterSpacing: 1,
    }
});
