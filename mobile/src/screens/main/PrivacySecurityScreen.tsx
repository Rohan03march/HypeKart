import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

type SettingsItemProps = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    subtitle?: string;
    danger?: boolean;
    onPress: () => void;
    isDarkMode: boolean;
};

const SettingsItem = ({ icon, title, subtitle, danger, onPress, isDarkMode }: SettingsItemProps) => {
    const textColor = danger ? '#ef4444' : (isDarkMode ? '#fff' : '#000');
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const iconColor = danger ? '#ef4444' : (isDarkMode ? '#fff' : '#000');
    const iconBg = danger ? (isDarkMode ? '#3f1111' : '#fee2e2') : (isDarkMode ? '#333' : '#f5f5f5');
    const chevronColor = isDarkMode ? '#555' : '#ccc';

    return (
        <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.textWrapper}>
                <Typography style={[styles.itemTitle, { color: textColor }]}>{title}</Typography>
                {subtitle && <Typography style={[styles.itemSubtitle, { color: subtextColor }]}>{subtitle}</Typography>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={chevronColor} />
        </TouchableOpacity>
    );
};

export default function PrivacySecurityScreen() {
    const navigation = useNavigation<any>();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => Alert.alert('Request Submitted', 'Your account deletion request has been submitted to support.')
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBgColor }]}>
                    <Ionicons name="arrow-back" size={20} color={textColor} />
                </TouchableOpacity>
                <Typography style={[styles.headerTitle, { color: textColor }]}>Privacy & Security</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>

                <View style={styles.section}>
                    <Typography style={[styles.sectionTitle, { color: subtextColor }]}>Security</Typography>
                    <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
                        <SettingsItem
                            icon="key-outline"
                            title="Change Password"
                            subtitle="Update your account password"
                            onPress={() => Alert.alert('Change Password', 'An email has been sent to your registered address with instructions to change your password.')}
                            isDarkMode={isDarkMode}
                        />
                        <View style={[styles.divider, { backgroundColor: borderColor }]} />
                        <SettingsItem
                            icon="finger-print-outline"
                            title="Biometric Login"
                            subtitle="Enable Face ID or Touch ID"
                            onPress={() => Alert.alert('Coming Soon', 'Biometric login will be available in the next update.')}
                            isDarkMode={isDarkMode}
                        />
                        <View style={[styles.divider, { backgroundColor: borderColor }]} />
                        <SettingsItem
                            icon="shield-checkmark-outline"
                            title="Two-Factor Authentication"
                            subtitle="Add an extra layer of security"
                            onPress={() => Alert.alert('MFA', 'Multi-factor authentication settings are managed via your Clerk account.')}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Typography style={[styles.sectionTitle, { color: subtextColor }]}>Privacy</Typography>
                    <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
                        <SettingsItem
                            icon="document-text-outline"
                            title="Privacy Policy"
                            subtitle="Read how we handle your data"
                            onPress={() => Alert.alert('Privacy Policy', 'Redirecting to Privacy Policy...')}
                            isDarkMode={isDarkMode}
                        />
                        <View style={[styles.divider, { backgroundColor: borderColor }]} />
                        <SettingsItem
                            icon="download-outline"
                            title="Download Your Data"
                            subtitle="Request a copy of your personal data"
                            onPress={() => Alert.alert('Data Request', 'A download link will be emailed to you within 24 hours.')}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                <View style={[styles.section, { marginTop: 10 }]}>
                    <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
                        <SettingsItem
                            icon="trash-outline"
                            title="Delete Account"
                            subtitle="Permanently remove your account and data"
                            danger
                            onPress={handleDeleteAccount}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                    <Typography style={[styles.disclaimer, { color: subtextColor }]}>
                        Deleting your account will remove all your order history, saved addresses, and active wishlists.
                    </Typography>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
    card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    settingsItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconWrapper: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    textWrapper: { flex: 1, marginLeft: 16 },
    itemTitle: { fontSize: 16, fontWeight: '500' },
    itemSubtitle: { fontSize: 13, marginTop: 2 },
    divider: { height: 1, marginLeft: 72 },
    disclaimer: { fontSize: 12, lineHeight: 18, marginTop: 12, marginHorizontal: 8, textAlign: 'center' }
});
