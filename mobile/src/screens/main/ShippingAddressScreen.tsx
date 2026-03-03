import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useAddressStore, Address } from '../../store/addressStore';
import * as Location from 'expo-location';

export default function ShippingAddressScreen() {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress } = useAddressStore();

    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Form state
    const [form, setForm] = useState({
        full_name: user?.fullName || '',
        phone: (user?.unsafeMetadata?.contact_phone as string) || user?.primaryPhoneNumber?.phoneNumber || '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const handleUseCurrentLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                setIsLocating(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            });
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                const addressParts = [
                    addr.name,
                    addr.streetNumber,
                    addr.street,
                    addr.district,
                    addr.subregion,
                ].filter(Boolean);

                setForm(prev => ({
                    ...prev,
                    address: addressParts.join(', '),
                    city: addr.city || addr.subregion || addr.region || '',
                    state: addr.region || '',
                    pincode: addr.postalCode || ''
                }));
            }
        } catch (error) {
            console.error("Error getting location:", error);
            alert("Failed to get current location");
        } finally {
            setIsLocating(false);
        }
    };

    const handleSaveAddress = () => {
        if (!form.address.trim() || !form.city.trim() || !form.pincode.trim()) {
            alert('Please fill in Address, City, and Pincode');
            return;
        }

        const newAddress: Address = {
            id: Date.now().toString(),
            full_name: form.full_name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode
        };
        addAddress(newAddress);
        setAddModalVisible(false);
        setForm({
            full_name: user?.fullName || '',
            phone: (user?.unsafeMetadata?.contact_phone as string) || user?.primaryPhoneNumber?.phoneNumber || '',
            address: '',
            city: '',
            state: '',
            pincode: ''
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Typography style={styles.headerTitle}>Delivery Address</Typography>
                <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.iconBtn}>
                    <Ionicons name="add" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
                <View style={styles.empty}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="location-outline" size={36} color="#ccc" />
                    </View>
                    <Typography style={styles.emptyTitle}>No address found</Typography>
                    <Typography style={styles.emptySubtitle}>
                        Add a delivery address to ensure smooth checkout.
                    </Typography>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setAddModalVisible(true)}>
                        <Typography style={styles.primaryBtnText}>Add New Address</Typography>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Typography style={styles.sectionLabel}>Saved Addresses</Typography>
                    {addresses.map((item) => {
                        const isSelected = item.id === selectedAddressId;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                                onPress={() => selectAddress(item.id)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.addressHeader}>
                                    <View style={styles.radioContainer}>
                                        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                            {isSelected && <View style={styles.radioInner} />}
                                        </View>
                                        <Typography style={styles.addressName}>{item.full_name || 'My Address'}</Typography>
                                    </View>
                                    <TouchableOpacity onPress={() => removeAddress(item.id)} style={{ padding: 4 }}>
                                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.addressBody}>
                                    <Typography style={styles.addressText}>{item.address}</Typography>
                                    <Typography style={styles.addressText}>{item.city}, {item.state} {item.pincode}</Typography>
                                    {!!item.phone && <Typography style={styles.addressPhone}>Phone: {item.phone}</Typography>}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {/* Add Address Modal */}
            <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Typography style={styles.modalTitle}>Add Address</Typography>
                        <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 24 }}>
                        <TouchableOpacity style={styles.locationBtn} onPress={handleUseCurrentLocation} disabled={isLocating}>
                            {isLocating ? (
                                <ActivityIndicator color="#000" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="navigate" size={18} color="#000" />
                                    <Typography style={styles.locationBtnText}>Use Current Location</Typography>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <Typography style={styles.inputLabel}>Full Name</Typography>
                        <TextInput style={styles.input} value={form.full_name} onChangeText={(t) => setForm({ ...form, full_name: t })} placeholder="John Doe" />

                        <Typography style={styles.inputLabel}>Phone Number</Typography>
                        <TextInput style={styles.input} value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} placeholder="10-digit mobile number" keyboardType="phone-pad" />

                        <Typography style={styles.inputLabel}>Address (Flat, House no., Area, Street)</Typography>
                        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} placeholder="Enter full address" multiline />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Typography style={styles.inputLabel}>City</Typography>
                                <TextInput style={styles.input} value={form.city} onChangeText={(t) => setForm({ ...form, city: t })} placeholder="City" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography style={styles.inputLabel}>Pincode</Typography>
                                <TextInput style={styles.input} value={form.pincode} onChangeText={(t) => setForm({ ...form, pincode: t })} placeholder="Pincode" keyboardType="number-pad" />
                            </View>
                        </View>

                        <Typography style={styles.inputLabel}>State</Typography>
                        <TextInput style={styles.input} value={form.state} onChangeText={(t) => setForm({ ...form, state: t })} placeholder="State" />

                        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={handleSaveAddress}>
                            <Typography style={styles.primaryBtnText}>Save Address</Typography>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 20 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
    addressCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    addressCardSelected: { borderColor: '#000', backgroundColor: '#fafafa' },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    radioContainer: { flexDirection: 'row', alignItems: 'center' },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    radioOuterSelected: { borderColor: '#000' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000' },
    addressName: { fontSize: 15, fontWeight: '600', color: '#000' },
    addressBody: { paddingLeft: 32 },
    addressText: { fontSize: 14, color: '#666', lineHeight: 22 },
    addressPhone: { fontSize: 13, color: '#999', marginTop: 8, fontWeight: '500' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '500', color: '#000', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    primaryBtn: { backgroundColor: '#000', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
    closeBtn: { padding: 4 },
    locationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', paddingVertical: 14, borderRadius: 16, gap: 8 },
    locationBtnText: { fontSize: 15, fontWeight: '600', color: '#000' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 24 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eaeaea', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#000' }
});
