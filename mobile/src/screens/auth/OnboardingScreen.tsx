import React, { useState } from 'react';
import {
    View, KeyboardAvoidingView, Platform, Alert,
    TouchableOpacity, StatusBar, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';

const GENDER_OPTIONS = [
    { label: 'Women', emoji: '👩', desc: 'Womenswear & accessories' },
    { label: 'Men', emoji: '👨', desc: 'Menswear & streetwear' },
    { label: 'Kids', emoji: '🧒', desc: 'Junior & youth styles' },
    { label: 'All', emoji: '✨', desc: 'Show me everything' },
];

export default function OnboardingScreen() {
    const { user } = useUser();
    const navigation = useNavigation<any>();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [gender, setGender] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const handleNext = () => {
        if (step === 1 && !name.trim()) {
            Alert.alert('Required', 'Please enter your name to continue.');
            return;
        }
        if (step === 2 && !gender) {
            Alert.alert('Required', 'Please select a shopping preference.');
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            await Location.requestForegroundPermissionsAsync();
            await user?.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    onboarding_completed: true,
                    name: name.trim(),
                    gender_preference: gender,
                },
            });
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSteps = 3;

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 }}>

                        {/* Step indicator */}
                        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 48 }}>
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <View key={i} style={{
                                    height: 4, flex: i + 1 === step ? 2 : 1,
                                    borderRadius: 2,
                                    backgroundColor: i + 1 <= step ? (isDarkMode ? '#ffffff' : '#111827') : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(17,24,39,0.2)')
                                }} />
                            ))}
                        </View>

                        {/* Step 1: Name */}
                        {step === 1 && (
                            <View style={{ flex: 1 }}>
                                <Typography style={{ fontSize: 13, fontWeight: '700', letterSpacing: 3, color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>Step 1 of 3</Typography>
                                <Typography style={{ fontSize: 32, fontWeight: '800', color: isDarkMode ? '#ffffff' : '#111827', lineHeight: 40, marginBottom: 10 }}>What should{'\n'}we call you?</Typography>
                                <Typography style={{ fontSize: 15, color: isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(17,24,39,0.55)', marginBottom: 40, lineHeight: 22 }}>Your name helps us personalize your shopping experience.</Typography>
                                <Input
                                    placeholder="Your full name"
                                    value={name}
                                    onChangeText={setName}
                                    autoFocus
                                    returnKeyType="next"
                                    onSubmitEditing={handleNext}
                                />
                            </View>
                        )}

                        {/* Step 2: Gender preference */}
                        {step === 2 && (
                            <View style={{ flex: 1 }}>
                                <Typography style={{ fontSize: 13, fontWeight: '700', letterSpacing: 3, color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>Step 2 of 3</Typography>
                                <Typography style={{ fontSize: 32, fontWeight: '800', color: isDarkMode ? '#ffffff' : '#111827', lineHeight: 40, marginBottom: 10 }}>What are you{'\n'}shopping for?</Typography>
                                <Typography style={{ fontSize: 15, color: isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(17,24,39,0.55)', marginBottom: 32, lineHeight: 22 }}>{name ? `Hey ${name}!` : ''} Customize your feed.</Typography>

                                <View style={{ gap: 12 }}>
                                    {GENDER_OPTIONS.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.label}
                                            onPress={() => setGender(opt.label)}
                                            activeOpacity={0.8}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', gap: 16,
                                                paddingHorizontal: 20, paddingVertical: 18,
                                                borderRadius: 16,
                                                backgroundColor: gender === opt.label
                                                    ? (isDarkMode ? '#ffffff' : '#111827')
                                                    : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.05)'),
                                                borderWidth: 1.5,
                                                borderColor: gender === opt.label
                                                    ? (isDarkMode ? '#ffffff' : '#111827')
                                                    : (isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.1)'),
                                            }}
                                        >
                                            <Typography style={{ fontSize: 28 }}>{opt.emoji}</Typography>
                                            <View style={{ flex: 1 }}>
                                                <Typography style={{
                                                    fontSize: 16, fontWeight: '700',
                                                    color: gender === opt.label
                                                        ? (isDarkMode ? '#111827' : '#ffffff')
                                                        : (isDarkMode ? '#ffffff' : '#111827'),
                                                    marginBottom: 2
                                                }}>{opt.label}</Typography>
                                                <Typography style={{
                                                    fontSize: 13,
                                                    color: gender === opt.label
                                                        ? (isDarkMode ? '#6b7280' : 'rgba(255,255,255,0.7)')
                                                        : (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(17,24,39,0.5)')
                                                }}>{opt.desc}</Typography>
                                            </View>
                                            {gender === opt.label && (
                                                <View style={{
                                                    width: 22, height: 22, borderRadius: 11,
                                                    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <Typography style={{ fontSize: 12, color: isDarkMode ? '#ffffff' : '#111827' }}>✓</Typography>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Step 3: Location */}
                        {step === 3 && (
                            <View style={{ flex: 1 }}>
                                <Typography style={{ fontSize: 13, fontWeight: '700', letterSpacing: 3, color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>Step 3 of 3</Typography>
                                <Typography style={{ fontSize: 32, fontWeight: '800', color: isDarkMode ? '#ffffff' : '#111827', lineHeight: 40, marginBottom: 10 }}>Enable{'\n'}Location 📍</Typography>
                                <Typography style={{ fontSize: 15, color: isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(17,24,39,0.55)', marginBottom: 40, lineHeight: 22 }}>
                                    We use your location for accurate delivery estimates and to show exclusive local drops.
                                </Typography>

                                <View style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.05)', borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.1)' }}>
                                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(17,24,39,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                        <Typography style={{ fontSize: 36 }}>📍</Typography>
                                    </View>
                                    <Typography style={{ fontSize: 16, fontWeight: '700', color: isDarkMode ? '#ffffff' : '#111827', marginBottom: 8, textAlign: 'center' }}>Location Access</Typography>
                                    <Typography style={{ fontSize: 14, color: isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(17,24,39,0.55)', textAlign: 'center', lineHeight: 20 }}>
                                        Only accessed while using the app. You can change this anytime in Settings.
                                    </Typography>
                                </View>
                            </View>
                        )}

                        {/* CTA Button */}
                        <View style={{ marginTop: 40 }}>
                            <TouchableOpacity
                                onPress={step === 3 ? handleComplete : handleNext}
                                activeOpacity={0.85}
                                style={{ backgroundColor: isDarkMode ? '#ffffff' : '#111827', borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={isDarkMode ? '#111827' : '#ffffff'} />
                                ) : (
                                    <Typography style={{ fontSize: 16, fontWeight: '800', color: isDarkMode ? '#111827' : '#ffffff' }}>
                                        {step === 3 ? 'Get Started →' : 'Continue →'}
                                    </Typography>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
