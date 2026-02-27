import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';

export default function PersonalDetailsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();

    const name = (user?.unsafeMetadata?.name as string) || user?.fullName || '—';
    const email = user?.primaryEmailAddress?.emailAddress || '—';
    const phone = user?.primaryPhoneNumber?.phoneNumber || 'Not added';
    const joined = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—';

    const fields = [
        { label: 'Full Name', value: name, icon: 'person-outline' },
        { label: 'Email', value: email, icon: 'mail-outline' },
        { label: 'Phone', value: phone, icon: 'call-outline' },
        { label: 'Member Since', value: joined, icon: 'calendar-outline' },
    ];

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
                    {user?.imageUrl ? (
                        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={36} color="#ccc" />
                        </View>
                    )}
                    <Typography style={styles.avatarName}>{name}</Typography>
                    <Typography style={styles.avatarEmail}>{email}</Typography>
                </View>

                <Typography style={styles.sectionLabel}>Account Info</Typography>
                <View style={styles.card}>
                    {fields.map((f, i) => (
                        <View key={f.label} style={[styles.row, i > 0 && styles.rowBorder]}>
                            <View style={styles.rowLeft}>
                                <View style={styles.rowIcon}>
                                    <Ionicons name={f.icon as any} size={18} color="#666" />
                                </View>
                                <View>
                                    <Typography style={styles.fieldLabel}>{f.label}</Typography>
                                    <Typography style={styles.fieldValue}>{f.value}</Typography>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.noteCard}>
                    <Ionicons name="information-circle-outline" size={18} color="#999" />
                    <Typography style={styles.noteText}>
                        Your account is managed by Clerk. To update your name or email, sign out and update via the sign-in page.
                    </Typography>
                </View>
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
});
