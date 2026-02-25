import React, { useState } from 'react';
import {
    View, KeyboardAvoidingView, Platform, TouchableOpacity,
    ScrollView, StatusBar, ActivityIndicator, StyleSheet, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';

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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Top 40% Editorial Hero Image */}
            <View style={styles.heroSection}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1542272201-b1ca555f8505?q=80&w=1200&auto=format&fit=crop' }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(10,10,10,1)']}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>

            {/* Bottom 60% Solid Black Premium Sheet */}
            <View style={styles.sheetContainer}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40 }}
                    >
                        {/* Header Details */}
                        <View style={styles.headerContainer}>
                            <Typography style={styles.brandSubtitle}>HYPEKART LOG IN</Typography>
                            <Typography style={styles.headerText}>Enter your details.</Typography>
                        </View>

                        <View style={styles.formContainer}>
                            {/* Stark Email Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    autoCapitalize="none"
                                    value={email}
                                    placeholder="Email address"
                                    placeholderTextColor="#666666"
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    style={styles.input}
                                />
                            </View>

                            {/* Stark Password Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={password}
                                    placeholder="Password"
                                    placeholderTextColor="#666666"
                                    secureTextEntry
                                    onChangeText={setPassword}
                                    style={styles.input}
                                />
                            </View>

                            <TouchableOpacity style={{ alignSelf: 'flex-start', marginBottom: 36 }}>
                                <Typography style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>
                                    Forgotten your password?
                                </Typography>
                            </TouchableOpacity>

                            {/* Aggressive Solid White Login Button */}
                            <TouchableOpacity style={styles.primaryButton} onPress={onSignIn} activeOpacity={0.9} disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Typography style={styles.buttonText}>SIGN IN</Typography>
                                )}
                            </TouchableOpacity>

                            {/* Refined Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Typography style={styles.dividerText}>OR</Typography>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Hollow Google Button */}
                            <TouchableOpacity onPress={onGoogle} activeOpacity={0.7} disabled={isLoading} style={styles.socialButton}>
                                <Ionicons name="logo-google" size={18} color="#ffffff" />
                                <Typography style={styles.socialButtonText}>Continue with Google</Typography>
                            </TouchableOpacity>
                        </View>

                        {/* Footer Action */}
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.footerLink}>
                                <Typography style={styles.footerText}>BECOME A MEMBER</Typography>
                                <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    heroSection: {
        height: '40%',
        width: '100%',
        position: 'absolute',
        top: 0,
    },
    sheetContainer: {
        flex: 1,
        marginTop: '65%',
        backgroundColor: '#0a0a0a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    headerContainer: {
        marginBottom: 32,
    },
    brandSubtitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 3,
        marginBottom: 6,
    },
    headerText: {
        fontSize: 32,
        fontWeight: '300',
        color: '#ffffff',
        letterSpacing: -1,
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        height: 60,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderColor: '#333333',
        backgroundColor: 'transparent',
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#ffffff',
        fontSize: 16,
        paddingHorizontal: 0,
    },
    primaryButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderRadius: 2,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#000000',
        letterSpacing: 2,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#222222',
    },
    dividerText: {
        fontSize: 11,
        color: '#666666',
        paddingHorizontal: 16,
        letterSpacing: 1,
    },
    socialButton: {
        flexDirection: 'row',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#333333',
        gap: 12,
        borderRadius: 2,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    footer: {
        marginTop: 40,
        alignItems: 'flex-start',
    },
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ffffff',
        paddingBottom: 4,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 2,
    }
});
