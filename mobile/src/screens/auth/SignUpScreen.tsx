import React, { useState } from 'react';
import {
    View, KeyboardAvoidingView, Platform, TouchableOpacity,
    ScrollView, StatusBar, ActivityIndicator, StyleSheet, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '@clerk/clerk-expo';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';

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
            alert(err?.errors?.[0]?.message || 'Failed to sign up');
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
                alert('Verification failed. Please try again.');
            }
        } catch (err: any) {
            alert(err?.errors?.[0]?.message || 'Failed to verify');
        } finally {
            setIsLoading(false);
        }
    };

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
                        {!pending ? (
                            <>
                                <View style={styles.headerContainer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
                                            <Ionicons name="arrow-back" size={20} color="#ffffff" />
                                        </TouchableOpacity>
                                        <Typography style={styles.brandSubtitle}>JOIN HYPEKART</Typography>
                                    </View>
                                    <Typography style={styles.headerText}>Create account.</Typography>
                                </View>

                                <View style={styles.formContainer}>
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

                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            value={password}
                                            placeholder="Create Password"
                                            placeholderTextColor="#666666"
                                            secureTextEntry
                                            onChangeText={setPassword}
                                            style={styles.input}
                                        />
                                    </View>

                                    <Typography style={styles.termsText}>
                                        By signing up, you agree to our Terms of Service and Privacy Policy.
                                    </Typography>

                                    <TouchableOpacity style={styles.primaryButton} onPress={onSignUp} activeOpacity={0.9} disabled={isLoading}>
                                        {isLoading ? (
                                            <ActivityIndicator color="#000" />
                                        ) : (
                                            <Typography style={styles.buttonText}>CONTINUE</Typography>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.footer}>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.footerLink}>
                                        <Typography style={styles.footerText}>ALREADY A MEMBER? SIGN IN</Typography>
                                        <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.headerContainer}>
                                    <Typography style={styles.brandSubtitle}>VERIFICATION</Typography>
                                    <Typography style={styles.headerText}>Check your email.</Typography>
                                </View>

                                <View style={styles.formContainer}>
                                    <View style={styles.verifyBox}>
                                        <Ionicons name="mail-open-outline" size={32} color="#ffffff" style={{ marginBottom: 12 }} />
                                        <Typography style={{ color: '#aaaaaa', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                                            We sent a verification code to:{'\n'}
                                            <Typography style={{ color: '#ffffff', fontWeight: '800' }}>{email}</Typography>
                                        </Typography>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            value={code}
                                            placeholder="000 000"
                                            placeholderTextColor="#333333"
                                            onChangeText={setCode}
                                            keyboardType="number-pad"
                                            style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8, paddingHorizontal: 0, fontWeight: '800' }]}
                                            autoFocus
                                            maxLength={6}
                                        />
                                    </View>

                                    <TouchableOpacity style={[styles.primaryButton, { marginTop: 24 }]} onPress={onVerify} activeOpacity={0.9} disabled={isLoading}>
                                        {isLoading ? (
                                            <ActivityIndicator color="#000" />
                                        ) : (
                                            <Typography style={styles.buttonText}>VERIFY ACCOUNT</Typography>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setPending(false)} style={{ alignItems: 'center', marginTop: 32 }}>
                                        <Typography style={{ fontSize: 12, color: '#666666', fontWeight: '800', letterSpacing: 1 }}>← CHANGE EMAIL ADDRESS</Typography>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
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
    termsText: {
        fontSize: 11,
        color: '#666666',
        lineHeight: 18,
        marginBottom: 32,
        marginTop: 8,
    },
    primaryButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#000000',
        letterSpacing: 2,
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
    },
    verifyBox: {
        padding: 24,
        borderRadius: 2,
        alignItems: 'center',
        marginBottom: 32,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#333333',
    }
});
