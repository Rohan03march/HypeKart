import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAuth, useSessionList, useSignIn } from '@clerk/clerk-expo';

export default function PrivacySecurityScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const { sessionId, signOut } = useAuth();
    const { sessions } = useSessionList();
    const { signIn, setActive } = useSignIn();

    const [isDeleting, setIsDeleting] = useState(false);

    // Password Change State
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleManageSessions = () => {
        if (!sessions) return;
        const otherSessions = sessions.filter(s => s.id !== sessionId && s.status === 'active');

        if (otherSessions.length === 0) {
            Alert.alert('Active Sessions', 'You only have 1 active session (this device).');
            return;
        }

        Alert.alert(
            'Active Sessions',
            `You have ${otherSessions.length} active session(s) on other devices.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign out all others',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // @ts-ignore: Clerk types miss the .revoke() method natively on SessionResource but it exists on the client
                            await Promise.all(otherSessions.map(s => s.revoke()));
                            Alert.alert('Success', 'All other devices have been signed out.');
                        } catch (e: any) {
                            Alert.alert('Error', 'Failed to revoke sessions.');
                        }
                    }
                }
            ]
        );
    };

    const handlePasswordChangeRequest = () => {
        setIsPasswordModalVisible(true);
    };

    const handleVerifyAndChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert('Error', 'Please enter both your current password and your new password.');
            return;
        }
        setIsVerifying(true);
        try {
            await user?.updatePassword({
                currentPassword,
                newPassword,
                signOutOfOtherSessions: true,
            });
            Alert.alert('Success', 'Your password has been changed successfully.');
            setIsPasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.errors?.[0]?.message || 'Failed to update password. Please check your current password.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleForgotPasswordRedirect = () => {
        Alert.alert(
            'Reset Password via Email',
            'To reset your password using an email verification code (OTP), you must be securely signed out of your current session. Would you like to sign out now?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out & Reset', style: 'destructive', onPress: async () => { await signOut(); } }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all order history, wishlisted items, and preferences.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: async () => {
                        if (!user) return;
                        setIsDeleting(true);
                        try {
                            await user.delete();
                            // Clerk automatically handles sign out upon user deletion
                        } catch (error: any) {
                            Alert.alert('Error', error.errors?.[0]?.message || 'Failed to delete account. Please try again later.');
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const SECTIONS = [
        {
            title: 'Privacy',
            items: [
                { icon: 'eye-outline', label: 'Data Usage', sub: 'How we use your data', onPress: () => Alert.alert('Privacy', 'We only collect data necessary to process your transactions.') },
                { icon: 'location-outline', label: 'Location Data', sub: 'Used only for delivery', onPress: () => Alert.alert('Location', 'Used exclusively for calculating shipping targets.') },
            ],
        },
        {
            title: 'Security',
            items: [
                { icon: 'lock-closed-outline', label: 'Password & Authentication', sub: 'Change your password securely', onPress: handlePasswordChangeRequest },
                { icon: 'phone-portrait-outline', label: 'Active Sessions', sub: 'View and manage signed-in devices', onPress: handleManageSessions },
                { icon: 'shield-checkmark-outline', label: 'Two-Factor Authentication', sub: 'Enabled via security portal', onPress: () => Alert.alert('2FA', 'Multi-factor authentication is configured in your web security settings.') },
            ],
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Typography style={styles.headerTitle}>Privacy & Security</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {SECTIONS.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Typography style={styles.sectionLabel}>{section.title}</Typography>
                        <View style={styles.card}>
                            {section.items.map((item, i) => (
                                <TouchableOpacity key={item.label} onPress={item.onPress} activeOpacity={0.7} style={[styles.row, i > 0 && styles.rowBorder]}>
                                    <View style={styles.rowIcon}>
                                        <Ionicons name={item.icon as any} size={18} color="#000" />
                                    </View>
                                    <View style={styles.rowText}>
                                        <Typography style={styles.rowLabel}>{item.label}</Typography>
                                        <Typography style={styles.rowSub}>{item.sub}</Typography>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.noteCard}>
                    <Ionicons name="shield-outline" size={20} color="#22c55e" />
                    <Typography style={styles.noteText}>
                        Your account and payments are protected by bank-level, PCI-DSS compliant infrastructure.
                    </Typography>
                </View>

                {/* Danger Zone */}
                <View style={[styles.section, { marginTop: 40 }]}>
                    <Typography style={[styles.sectionLabel, { color: '#ef4444' }]}>DANGER ZONE</Typography>
                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        disabled={isDeleting}
                        activeOpacity={0.8}
                        style={[styles.card, styles.deleteCard]}
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="#ef4444" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                <Typography style={styles.deleteText}>Delete Account Permanently</Typography>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Password Change Modal */}
            <Modal visible={isPasswordModalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Typography style={styles.modalTitle}>Change Password</Typography>
                        <Typography style={styles.modalSub}>
                            To secure your account, please verify your current password before setting a new one.
                        </Typography>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Current Password"
                            placeholderTextColor="#999"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="New Password"
                            placeholderTextColor="#999"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity onPress={handleForgotPasswordRedirect} style={{ marginBottom: 20 }}>
                            <Typography style={{ color: '#000', fontSize: 13, textDecorationLine: 'underline', alignSelf: 'flex-end', fontWeight: '500' }}>Forgot Current Password?</Typography>
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)} style={styles.modalCancelBtn}>
                                <Typography style={styles.modalCancelText}>Cancel</Typography>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleVerifyAndChangePassword} style={styles.modalConfirmBtn} disabled={isVerifying}>
                                {isVerifying ? <ActivityIndicator color="#fff" /> : <Typography style={styles.modalConfirmText}>Save Password</Typography>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 20, paddingBottom: 60 },
    section: { marginBottom: 28 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    rowBorder: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: '500', color: '#000', marginBottom: 2 },
    rowSub: { fontSize: 12, color: '#999' },
    noteCard: { flexDirection: 'row', gap: 12, backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, alignItems: 'flex-start' },
    noteText: { fontSize: 13, color: '#555', lineHeight: 20, flex: 1 },
    deleteCard: { backgroundColor: '#fee2e2', padding: 20, alignItems: 'center', justifyContent: 'center' },
    deleteText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8, textAlign: 'center' },
    modalSub: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center', lineHeight: 22 },
    modalInput: { backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#000', marginBottom: 16 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalCancelBtn: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
    modalCancelText: { color: '#000', fontSize: 15, fontWeight: '600' },
    modalConfirmBtn: { flex: 1, backgroundColor: '#000', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
    modalConfirmText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
