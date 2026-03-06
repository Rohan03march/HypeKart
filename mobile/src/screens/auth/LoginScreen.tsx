import React, { useState } from 'react';
import {
    View, KeyboardAvoidingView, Platform, TouchableOpacity,
    ScrollView, ActivityIndicator, StyleSheet, TextInput, Modal, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../../store/themeStore';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWarmUpBrowser();
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    // Forgot Password State
    const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
    const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    React.useEffect(() => {
        const checkPendingReset = async () => {
            try {
                const pendingEmail = await AsyncStorage.getItem('pendingPasswordReset');
                if (pendingEmail) {
                    await AsyncStorage.removeItem('pendingPasswordReset');
                    setForgotEmail(pendingEmail);
                    setForgotStep('otp'); // Skip email input step
                    setIsForgotModalVisible(true);

                    // We don't trigger signIn.create here automatically to avoid silent errors.
                    // Instead, ChangePasswordScreen already triggered the email.
                    // Wait, ChangePasswordScreen couldn't trigger the email because of the session error!
                    // Ah! We must trigger it here.

                    setIsResetting(true);
                    try {
                        await signIn?.create({
                            strategy: 'reset_password_email_code',
                            identifier: pendingEmail,
                        });
                    } catch (err: any) {
                        Alert.alert('Error', err?.errors?.[0]?.message || 'Failed to initiate password reset automatically. Please request a new OTP.');
                        setForgotStep('email'); // Fallback to asking them to retry
                    } finally {
                        setIsResetting(false);
                    }
                }
            } catch (error) {
                console.error('Error checking pending reset:', error);
            }
        };

        if (isLoaded) {
            checkPendingReset();
        }
    }, [isLoaded, signIn]);

    const onSignIn = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        try {
            const result = await signIn.create({ identifier: email, password });
            await setActive({ session: result.createdSessionId });
        } catch (err: any) {
            alert(err?.errors?.[0]?.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const onGoogle = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const { createdSessionId, setActive } = await startOAuthFlow();
            if (createdSessionId && setActive) await setActive({ session: createdSessionId });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [startOAuthFlow]);

    const handleForgotPasswordStart = async () => {
        if (!forgotEmail) {
            Alert.alert('Required', 'Please enter your email address first.');
            return;
        }
        setIsResetting(true);
        try {
            await signIn?.create({
                strategy: 'reset_password_email_code',
                identifier: forgotEmail,
            });
            setForgotStep('otp');
        } catch (err: any) {
            Alert.alert('Error', err?.errors?.[0]?.message || 'Failed to initiate password reset.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleForgotPasswordVerify = async () => {
        if (!otpCode || !newPassword) {
            Alert.alert('Required', 'Please fill in both the OTP and your new password.');
            return;
        }
        setIsResetting(true);
        try {
            const result = await signIn?.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: otpCode,
                password: newPassword,
            });
            if (result?.status === 'complete') {
                await setActive?.({ session: result.createdSessionId });
                setIsForgotModalVisible(false);
            } else {
                Alert.alert('Error', 'OTP verification failed or is incomplete.');
            }
        } catch (err: any) {
            Alert.alert('Error', err?.errors?.[0]?.message || 'Failed to change password. Ensure the OTP is correct.');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]} edges={['top', 'bottom']}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor="transparent" translucent />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Editorial Top Branding */}
                    <View style={styles.headerContainer}>
                        <Typography style={[styles.logoText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>H Y P E K A R T</Typography>
                        <Typography style={styles.greetingText}>SIGN IN TO CONTINUE</Typography>
                    </View>

                    {/* Elegant Minimalist Form */}
                    <View style={styles.formContainer}>
                        <View style={[styles.inputContainer, { borderColor: isDarkMode ? '#333' : '#EAEAEA' }]}>
                            <TextInput
                                autoCapitalize="none"
                                value={email}
                                placeholder="Email Address"
                                placeholderTextColor="#999999"
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                style={[styles.input, { color: isDarkMode ? '#ffffff' : '#000000' }]}
                            />
                        </View>

                        <View style={[styles.inputContainer, { borderColor: isDarkMode ? '#333' : '#EAEAEA' }]}>
                            <TextInput
                                value={password}
                                placeholder="Password"
                                placeholderTextColor="#999999"
                                secureTextEntry
                                onChangeText={setPassword}
                                style={[styles.input, { color: isDarkMode ? '#ffffff' : '#000000' }]}
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotPassword} onPress={() => { setForgotStep('email'); setForgotEmail(email); setIsForgotModalVisible(true); }}>
                            <Typography style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Typography>
                        </TouchableOpacity>

                        {/* Authoritative Black Button */}
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDarkMode ? '#ffffff' : '#000000' }]} onPress={onSignIn} activeOpacity={0.8} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color={isDarkMode ? '#000000' : '#ffffff'} />
                            ) : (
                                <Typography style={[styles.buttonText, { color: isDarkMode ? '#000000' : '#ffffff' }]}>SIGN IN</Typography>
                            )}
                        </TouchableOpacity>

                        {/* Minimalist Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Typography style={styles.dividerText}>OR</Typography>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Clean Google Button */}
                        <TouchableOpacity onPress={onGoogle} activeOpacity={0.8} disabled={isLoading} style={[styles.socialButton, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff', borderColor: isDarkMode ? '#333' : '#EAEAEA' }]}>
                            <Ionicons name="logo-google" size={18} color={isDarkMode ? '#ffffff' : '#000000'} />
                            <Typography style={[styles.socialButtonText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Continue with Google</Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Subtle Footer Action */}
                    <View style={styles.footer}>
                        <Typography style={{ color: '#888888', fontSize: 13, fontWeight: '500' }}>Don't have an account? </Typography>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Typography style={[styles.footerLinkText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Create Account</Typography>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Forgot Password Flow Modal */}
            <Modal visible={isForgotModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsForgotModalVisible(false)}>
                <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#121212' : '#ffffff' }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
                        <Typography style={[styles.modalTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Reset Password</Typography>
                        <TouchableOpacity onPress={() => setIsForgotModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 24 }}>
                        {forgotStep === 'email' ? (
                            <>
                                <Typography style={styles.modalSub}>
                                    Enter your registered email address and we will send a 6-digit OTP to verify your identity.
                                </Typography>
                                <Typography style={styles.inputLabel}>Email Address</Typography>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fcfcfc', borderColor: isDarkMode ? '#333' : '#eaeaea', color: isDarkMode ? '#ffffff' : '#000000' }]}
                                    value={forgotEmail}
                                    onChangeText={setForgotEmail}
                                    placeholder="your@email.com"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: isDarkMode ? '#ffffff' : '#000000' }]} onPress={handleForgotPasswordStart} disabled={isResetting}>
                                    {isResetting ? <ActivityIndicator color={isDarkMode ? '#000000' : '#ffffff'} /> : <Typography style={[styles.primaryBtnText, { color: isDarkMode ? '#000000' : '#ffffff' }]}>Send OTP</Typography>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Typography style={styles.modalSub}>
                                    We've sent an OTP to {forgotEmail}. Enter it below along with your new password.
                                </Typography>
                                <Typography style={styles.inputLabel}>6-Digit OTP</Typography>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fcfcfc', borderColor: isDarkMode ? '#333' : '#eaeaea', color: isDarkMode ? '#ffffff' : '#000000' }]}
                                    value={otpCode}
                                    onChangeText={setOtpCode}
                                    placeholderTextColor="#999"
                                    placeholder="000000"
                                    keyboardType="number-pad"
                                />
                                <Typography style={styles.inputLabel}>New Password</Typography>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fcfcfc', borderColor: isDarkMode ? '#333' : '#eaeaea', color: isDarkMode ? '#ffffff' : '#000000' }]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholderTextColor="#999"
                                    placeholder="Enter secure password"
                                    secureTextEntry
                                />
                                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: isDarkMode ? '#ffffff' : '#000000' }]} onPress={handleForgotPasswordVerify} disabled={isResetting}>
                                    {isResetting ? <ActivityIndicator color={isDarkMode ? '#000000' : '#ffffff'} /> : <Typography style={[styles.primaryBtnText, { color: isDarkMode ? '#000000' : '#ffffff' }]}>Change Password & Log In</Typography>}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setForgotStep('email')} style={{ marginTop: 24, alignSelf: 'center' }}>
                                    <Typography style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: 13, fontWeight: '600' }}>Change Email Address</Typography>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Pure, clinical white
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28, // More breathing room
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 56,
        marginTop: 60,
    },
    logoText: {
        fontSize: 26,
        fontWeight: '900',
        color: '#000000',
        marginBottom: 12,
        letterSpacing: 4, // Luxury high tracking
    },
    greetingText: {
        fontSize: 12,
        color: '#888888',
        fontWeight: '600',
        letterSpacing: 1,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        height: 52,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#EAEAEA', // Clean underline
        justifyContent: 'flex-end',
        paddingBottom: 8,
    },
    input: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
        marginTop: -4,
    },
    forgotPasswordText: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '600',
    },
    primaryButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#000000', // Stark authoritative black
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4, // Just a tiny rounding, feels sharp
        marginBottom: 28,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 2,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    dividerText: {
        fontSize: 11,
        color: '#AAAAAA',
        paddingHorizontal: 16,
        fontWeight: '600',
    },
    socialButton: {
        flexDirection: 'row',
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 4,
        gap: 12,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    footerLinkText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#000000',
        textDecorationLine: 'underline', // Classic editorial link style
    },
    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
    closeBtn: { padding: 4 },
    modalSub: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 24 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    modalInput: { backgroundColor: '#fcfcfc', borderWidth: 1, borderColor: '#eaeaea', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#000', marginBottom: 20 },
    primaryBtn: { backgroundColor: '#000', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
});
