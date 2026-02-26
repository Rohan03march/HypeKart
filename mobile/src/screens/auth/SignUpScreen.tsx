import React, { useState } from 'react';
import {
    View, KeyboardAvoidingView, Platform, TouchableOpacity,
    ScrollView, ActivityIndicator, StyleSheet, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '@clerk/clerk-expo';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pending, setPending] = useState(false);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSignUp = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        try {
            await signUp.create({ emailAddress: email, password });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPending(true);
        } catch (err: any) {
            alert(err?.errors?.[0]?.message || 'Failed to request access');
        } finally {
            setIsLoading(false);
        }
    };

    const onVerify = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({ code });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
            } else {
                alert('Verification failed. Retrying required.');
            }
        } catch (err: any) {
            alert(err?.errors?.[0]?.message || 'Verification sequence failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="dark" backgroundColor="transparent" translucent />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {!pending ? (
                        <>
                            {/* Editorial Top Branding */}
                            <View style={styles.headerContainer}>
                                <Typography style={styles.logoText}>H Y P E K A R T</Typography>
                                <Typography style={styles.greetingText}>CREATE AN ACCOUNT</Typography>
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

                                <Typography style={styles.termsText}>
                                    By proceeding, you agree to the Terms of Service.
                                </Typography>

                                {/* Authoritative Black Button */}
                                <TouchableOpacity style={styles.primaryButton} onPress={onSignUp} activeOpacity={0.8} disabled={isLoading}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Typography style={styles.buttonText}>CONTINUE</Typography>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <Typography style={{ color: '#888888', fontSize: 13, fontWeight: '500' }}>Already have an account? </Typography>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Typography style={styles.footerLinkText}>Sign In</Typography>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            {/* OTP Verification UI - Editorial Style */}
                            <View style={[styles.headerContainer, { marginTop: 40 }]}>
                                <Typography style={styles.logoText}>V E R I F Y</Typography>
                            </View>

                            <View style={styles.formContainer}>
                                <Typography style={styles.verificationDesc}>
                                    ENTER THE CODE SENT TO:{'\n'}
                                    <Typography style={{ color: '#000000', fontWeight: '700', letterSpacing: 1 }}>{email}</Typography>
                                </Typography>

                                <View style={[styles.inputContainer, { borderBottomWidth: 2, borderColor: '#000000', height: 72 }]}>
                                    <TextInput
                                        value={code}
                                        placeholder="000 000"
                                        placeholderTextColor="#EAEAEA"
                                        onChangeText={setCode}
                                        keyboardType="number-pad"
                                        style={[styles.input, { textAlign: 'center', fontSize: 28, letterSpacing: 16, fontWeight: '600', color: '#000000' }]}
                                        autoFocus
                                        maxLength={6}
                                    />
                                </View>

                                <TouchableOpacity style={[styles.primaryButton, { marginTop: 48 }]} onPress={onVerify} activeOpacity={0.8} disabled={isLoading}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Typography style={styles.buttonText}>VERIFY ACCOUNT</Typography>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setPending(false)} style={{ alignItems: 'center', marginTop: 32 }}>
                                    <Typography style={{ fontSize: 12, color: '#888888', fontWeight: '600', textDecorationLine: 'underline' }}>USE A DIFFERENT EMAIL</Typography>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Pure white
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
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
        letterSpacing: 4,
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
        borderColor: '#EAEAEA',
        justifyContent: 'flex-end',
        paddingBottom: 8,
    },
    input: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    termsText: {
        fontSize: 11,
        color: '#888888',
        lineHeight: 16,
        marginBottom: 32,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    primaryButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#000000', // Stark black
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        marginBottom: 8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    footerLinkText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#000000',
        textDecorationLine: 'underline',
    },
    verificationDesc: {
        color: '#888888',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        letterSpacing: 1,
        fontWeight: '600'
    }
});
