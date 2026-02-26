import React, { useState } from 'react';
import {
    View, KeyboardAvoidingView, Platform, TouchableOpacity,
    ScrollView, ActivityIndicator, StyleSheet, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { StatusBar } from 'expo-status-bar';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWarmUpBrowser();
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="dark" backgroundColor="transparent" translucent />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Editorial Top Branding */}
                    <View style={styles.headerContainer}>
                        <Typography style={styles.logoText}>H Y P E K A R T</Typography>
                        <Typography style={styles.greetingText}>SIGN IN TO CONTINUE</Typography>
                    </View>

                    {/* Elegant Minimalist Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                autoCapitalize="none"
                                value={email}
                                placeholder="Email Address"
                                placeholderTextColor="#999999"
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                value={password}
                                placeholder="Password"
                                placeholderTextColor="#999999"
                                secureTextEntry
                                onChangeText={setPassword}
                                style={styles.input}
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Typography style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Typography>
                        </TouchableOpacity>

                        {/* Authoritative Black Button */}
                        <TouchableOpacity style={styles.primaryButton} onPress={onSignIn} activeOpacity={0.8} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Typography style={styles.buttonText}>SIGN IN</Typography>
                            )}
                        </TouchableOpacity>

                        {/* Minimalist Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Typography style={styles.dividerText}>OR</Typography>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Clean Google Button */}
                        <TouchableOpacity onPress={onGoogle} activeOpacity={0.8} disabled={isLoading} style={styles.socialButton}>
                            <Ionicons name="logo-google" size={18} color="#000000" />
                            <Typography style={styles.socialButtonText}>Continue with Google</Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Subtle Footer Action */}
                    <View style={styles.footer}>
                        <Typography style={{ color: '#888888', fontSize: 13, fontWeight: '500' }}>Don't have an account? </Typography>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Typography style={styles.footerLinkText}>Create Account</Typography>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    }
});
