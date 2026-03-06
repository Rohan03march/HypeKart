import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useThemeStore } from '../../store/themeStore';

export default function ChangePasswordScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const { signOut } = useAuth();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const [isLoading, setIsLoading] = useState(false);

    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';

    // If the user doesn't have a password set (e.g. OAuth only)
    const hasPassword = user?.passwordEnabled;
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    const handleSignOutAndReset = async () => {
        if (!userEmail) {
            Alert.alert('Error', 'No registered email address found for this account.');
            return;
        }

        Alert.alert(
            'Important',
            'To securely change your password using an OTP, you will be temporarily signed out.\n\nAn email with a 6-digit code will be sent to you automatically to log back in with your new password.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Proceed',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            // Save flag for LoginScreen to auto-trigger the Forgot Password modal
                            await AsyncStorage.setItem('pendingPasswordReset', userEmail);
                            await signOut();
                            // RootNavigator will automatically unmount this screen and show LoginScreen
                        } catch (err) {
                            console.error('Logout error during password reset flow:', err);
                            Alert.alert('Error', 'Failed to initiate password reset. Please try again.');
                            setIsLoading(false);
                            await AsyncStorage.removeItem('pendingPasswordReset');
                        }
                    }
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
                <Typography style={[styles.headerTitle, { color: textColor }]}>Change Password</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                {!hasPassword ? (
                    <View style={[styles.noPasswordContainer, { backgroundColor: cardBgColor, borderColor }]}>
                        <Ionicons name="information-circle-outline" size={32} color={textColor} style={{ marginBottom: 12 }} />
                        <Typography style={[styles.noPasswordText, { color: textColor }]}>
                            You are signed in using a social provider (e.g. Google) and do not have a separate password for this account.
                        </Typography>
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <View style={[styles.infoBox, { backgroundColor: cardBgColor, borderColor }]}>
                            <Ionicons name="shield-checkmark-outline" size={32} color={textColor} style={{ marginBottom: 12 }} />
                            <Typography style={[styles.infoText, { color: textColor }]}>
                                To maintain the highest security standards, changing your password requires verifying your identity via email.
                            </Typography>
                            <Typography style={[styles.infoText, { color: textColor, marginTop: 12 }]}>
                                You will be signed out, and a 6-digit One Time Password (OTP) will be sent to:
                            </Typography>
                            <Typography style={[styles.emailText, { color: textColor, marginTop: 4 }]}>{userEmail}</Typography>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: isDarkMode ? '#fff' : '#000' }]}
                            onPress={handleSignOutAndReset}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} />
                            ) : (
                                <Typography style={[styles.primaryBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Sign Out & Reset Password</Typography>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    formContainer: { marginTop: 8 },
    infoBox: { padding: 24, borderRadius: 16, borderWidth: 1, marginBottom: 24, alignItems: 'center' },
    infoText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
    emailText: { fontSize: 16, fontWeight: '700' },
    primaryBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    primaryBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: 1 },
    noPasswordContainer: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginTop: 20 },
    noPasswordText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
