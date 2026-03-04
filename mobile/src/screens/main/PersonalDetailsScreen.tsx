import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useThemeStore } from '../../store/themeStore';

export default function PersonalDetailsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const isDarkMode = useThemeStore(s => s.isDarkMode);

    const [isSaving, setIsSaving] = useState(false);

    // Initial state from user metadata or clerk primary fields
    const defaultName = (user?.unsafeMetadata?.name as string) || user?.fullName || '';
    const defaultPhone = (user?.unsafeMetadata?.contact_phone as string) || user?.primaryPhoneNumber?.phoneNumber || '';
    const email = (user?.unsafeMetadata?.contact_email as string) || user?.primaryEmailAddress?.emailAddress || '';

    const [form, setForm] = useState({
        name: defaultName,
        phone: defaultPhone,
    });

    const hasChanges = form.name !== defaultName || form.phone !== defaultPhone;

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    name: form.name.trim(),
                    contact_phone: form.phone.trim(),
                }
            });
            Alert.alert('Success', 'Your personal details have been updated.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update details. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Dark Mode Theme Values
    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';
    const inputBg = isDarkMode ? '#333' : '#fafafa';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBgColor }]}>
                    <Ionicons name="arrow-back" size={20} color={textColor} />
                </TouchableOpacity>
                <Typography style={[styles.headerTitle, { color: textColor }]}>Personal Details</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                <View style={[styles.infoCard, { backgroundColor: cardBgColor, borderColor }]}>
                    <Typography style={[styles.infoTitle, { color: textColor }]}>Account Information</Typography>
                    <Typography style={[styles.infoSubtitle, { color: subtextColor }]}>Update your basic profile information.</Typography>

                    <View style={styles.inputGroup}>
                        <Typography style={[styles.inputLabel, { color: subtextColor }]}>Full Name</Typography>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                            placeholderTextColor={subtextColor}
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography style={[styles.inputLabel, { color: subtextColor }]}>Email Address (Read Only)</Typography>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, borderColor, color: subtextColor, opacity: 0.7 }]}
                            value={email}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography style={[styles.inputLabel, { color: subtextColor }]}>Phone Number</Typography>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                            placeholderTextColor={subtextColor}
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                            placeholder="e.g. 9876543210"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {hasChanges && (
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: textColor }]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={bgColor} size="small" />
                        ) : (
                            <Typography style={[styles.saveBtnText, { color: bgColor }]}>Save Changes</Typography>
                        )}
                    </TouchableOpacity>
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
    infoCard: { padding: 20, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    infoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    infoSubtitle: { fontSize: 14, marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
    saveBtn: { marginTop: 32, paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { fontSize: 16, fontWeight: '600' }
});
