import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';

export default function PersonalDetailsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();

    const [isSaving, setIsSaving] = useState(false);
    const [fullName, setFullName] = useState((user?.unsafeMetadata?.name as string) || user?.fullName || '');
    const [phone, setPhone] = useState((user?.unsafeMetadata?.contact_phone as string) || user?.primaryPhoneNumber?.phoneNumber || '');

    const email = user?.primaryEmailAddress?.emailAddress || '—';
    const joined = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—';

    const handleSave = async () => {
        if (!user) return;
        if (!fullName.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }

        setIsSaving(true);
        try {
            const parts = fullName.trim().split(' ');
            const firstName = parts[0] || '';
            const lastName = parts.slice(1).join(' ') || '';

            await user.update({ firstName, lastName });
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    name: fullName.trim(),
                    contact_phone: phone.trim()
                }
            });

            Alert.alert('Success', 'Profile updated successfully.');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.errors?.[0]?.message || 'Failed to update user.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permissions are required to change your avatar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64 && user) {
            setIsSaving(true);
            try {
                const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
                await user.setProfileImage({ file: base64Img });
                Alert.alert('Success', 'Profile picture updated.');
            } catch (error: any) {
                Alert.alert('Error', 'Failed to upload image. Try a smaller file.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Typography style={styles.headerTitle}>Personal Details</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handleImagePick} activeOpacity={0.8} style={{ position: 'relative' }}>
                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={36} color="#ccc" />
                            </View>
                        )}
                        <View style={styles.pencilBadge}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Typography style={styles.avatarEmail}>{email}</Typography>
                </View>

                <Typography style={styles.sectionLabel}>Full Name</Typography>
                <View style={[styles.card, { paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 }]}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.rowIcon, { backgroundColor: '#f5f5f5' }]}>
                            <Ionicons name="person-outline" size={18} color="#666" />
                        </View>
                        <TextInput
                            style={styles.textInput}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                            placeholderTextColor="#ccc"
                        />
                    </View>
                </View>

                <Typography style={styles.sectionLabel}>Contact Info</Typography>
                <View style={[styles.card, { paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 }]}>
                    <View style={[styles.rowLeft, { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 12, marginBottom: 12 }]}>
                        <View style={[styles.rowIcon, { backgroundColor: '#f5f5f5' }]}>
                            <Ionicons name="mail-outline" size={18} color="#666" />
                        </View>
                        <View>
                            <Typography style={{ fontSize: 11, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 }}>Email (Read Only)</Typography>
                            <Typography style={{ fontSize: 15, color: '#666', fontWeight: '500' }}>{email}</Typography>
                        </View>
                    </View>

                    <View style={styles.rowLeft}>
                        <View style={[styles.rowIcon, { backgroundColor: '#f5f5f5' }]}>
                            <Ionicons name="call-outline" size={18} color="#666" />
                        </View>
                        <TextInput
                            style={styles.textInput}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            placeholderTextColor="#ccc"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <View style={styles.noteCard}>
                    <Ionicons name="information-circle-outline" size={18} color="#999" />
                    <Typography style={styles.noteText}>
                        These contact details are used for order communication. Your primary login email remains strictly unchanged.
                    </Typography>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                    disabled={isSaving}
                >
                    {isSaving ? <ActivityIndicator color="#fff" /> : <Typography style={styles.saveBtnText}>Save Changes</Typography>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 20 },
    avatarSection: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12 },
    avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarName: { fontSize: 20, fontWeight: '600', color: '#000', marginBottom: 4 },
    avatarEmail: { fontSize: 13, color: '#999' },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 20 },
    row: { paddingHorizontal: 20, paddingVertical: 14 },
    rowBorder: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
    fieldLabel: { fontSize: 11, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    fieldValue: { fontSize: 15, color: '#000', fontWeight: '500' },
    noteCard: { flexDirection: 'row', gap: 10, backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16 },
    noteText: { fontSize: 13, color: '#888', lineHeight: 20, flex: 1 },
    pencilBadge: { position: 'absolute', bottom: 10, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#000', borderWidth: 2, borderColor: '#fafafa', alignItems: 'center', justifyContent: 'center' },
    textInput: { flex: 1, fontSize: 16, fontWeight: '500', color: '#000', paddingVertical: 8 },
    saveBtn: { backgroundColor: '#000', borderRadius: 24, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
