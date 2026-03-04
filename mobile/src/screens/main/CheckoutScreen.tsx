import React, { useState, useRef } from 'react';
import {
    View, ScrollView, TouchableOpacity, TextInput,
    StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { Typography } from '../../components/ui/Typography';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../../store/cartStore';
import { useUser } from '@clerk/clerk-expo';

import { useAddressStore } from '../../store/addressStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const RAZORPAY_CHECKOUT_HTML = (keyId: string, orderId: string, amount: number, name: string, email: string, phone: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#000;">
  <script>
    var options = {
      key: "${keyId}",
      amount: "${amount}",
      currency: "INR",
      name: "HypeKart",
      description: "Order Payment",
      order_id: "${orderId}",
      prefill: { name: "${name}", email: "${email}", contact: "${phone}" },
      theme: { color: "#000000" },
      handler: function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PAYMENT_SUCCESS',
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id,
        }));
      },
      modal: {
        ondismiss: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_DISMISSED' }));
        }
      }
    };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function(resp) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_FAILED', error: resp.error.description }));
    });
    rzp.open();
  </script>
</body>
</html>
`;

export default function CheckoutScreen() {
    const navigation = useNavigation<any>();
    const { items, getCartTotal, clearCart } = useCartStore();
    const { user } = useUser();

    const [step, setStep] = useState<'address' | 'payment'>('address');
    const [isLoading, setIsLoading] = useState(false);
    const [razorpayHtml, setRazorpayHtml] = useState('');
    const [razorpayOrderId, setRazorpayOrderId] = useState('');
    const [razorpayKeyId, setRazorpayKeyId] = useState('');

    const subtotal = getCartTotal();
    const tax = subtotal * 0.18;
    const shipping = subtotal >= 1500 ? 0 : 99;
    const finalTotal = Math.round(subtotal + tax + shipping);

    const { addresses, selectedAddressId } = useAddressStore();
    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

    const isDarkMode = useThemeStore(s => s.isDarkMode);
    const bgColor = isDarkMode ? '#121212' : '#fafafa';
    const textColor = isDarkMode ? '#fff' : '#000';
    const subtextColor = isDarkMode ? '#aaa' : '#666';
    const cardBgColor = isDarkMode ? '#1e1e1e' : '#fff';
    const borderColor = isDarkMode ? '#333' : '#f0f0f0';
    const ctaBg = isDarkMode ? 'rgba(18,18,18,0.95)' : 'rgba(250,250,250,0.95)';

    const validateAddress = () => {
        if (!selectedAddress) return 'Please select a delivery address';
        if (!selectedAddress.full_name) return 'Full Name is required on the selected address';
        if (!selectedAddress.phone) return 'Phone number is required on the selected address';
        return null;
    };

    const handleProceedToPayment = async () => {
        const validationError = validateAddress();
        if (validationError) {
            Alert.alert('Missing Details', validationError);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/razorpay/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalTotal }),
            });
            const data = await res.json();
            if (!res.ok || !data.orderId) throw new Error(data.error || 'Could not initiate payment');

            setRazorpayOrderId(data.orderId);
            setRazorpayKeyId(data.keyId);
            setRazorpayHtml(RAZORPAY_CHECKOUT_HTML(
                data.keyId,
                data.orderId,
                data.amount,
                selectedAddress.full_name,
                (user?.unsafeMetadata?.contact_email as string) || user?.primaryEmailAddress?.emailAddress || '',
                selectedAddress.phone,
            ));
            setStep('payment');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to initiate payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWebViewMessage = async (event: any) => {
        try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'PAYMENT_SUCCESS') {
                setIsLoading(true);
                // Build order items payload
                const orderItems = items.map(item => ({
                    product_id: item.productId,
                    name: item.name,
                    image: item.image,
                    size: item.size,
                    color: item.color,
                    price: item.price,
                    quantity: item.quantity,
                }));

                const res = await fetch(`${API_URL}/razorpay/save-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_payment_id: msg.payment_id,
                        razorpay_order_id: msg.order_id,
                        amount: finalTotal,
                        items: orderItems,
                        shipping_address: selectedAddress,
                        user_clerk_id: user?.id,
                    }),
                });
                const saved = await res.json();
                if (!res.ok) throw new Error(saved.error || 'Failed to save order');

                clearCart();
                navigation.replace('OrderSuccess', { orderId: saved.orderId, paymentId: msg.payment_id });
            } else if (msg.type === 'PAYMENT_DISMISSED') {
                setStep('address');
            } else if (msg.type === 'PAYMENT_FAILED') {
                setStep('address');
                Alert.alert('Payment Failed', msg.error || 'Your payment could not be processed.');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong after payment.');
            setIsLoading(false);
        }
    };

    // ─── Payment WebView Step ───────────────────────────────────────
    if (step === 'payment') {
        return (
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                {isLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color={textColor} />
                        <Typography style={{ color: textColor, marginTop: 12 }}>Confirming your order…</Typography>
                    </View>
                )}
                <WebView
                    source={{ html: razorpayHtml }}
                    onMessage={handleWebViewMessage}
                    javaScriptEnabled
                    domStorageEnabled
                    style={{ flex: 1, backgroundColor: '#000' }}
                    onError={() => {
                        Alert.alert('Error', 'Failed to load payment page.');
                        setStep('address');
                    }}
                />
            </View>
        );
    }

    // ─── Address Step ──────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: cardBgColor }]}>
                    <Ionicons name="arrow-back" size={20} color={textColor} />
                </TouchableOpacity>
                <Typography style={[styles.headerTitle, { color: textColor }]}>Checkout</Typography>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Delivery Address */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography style={styles.sectionTitle}>Delivery Address</Typography>
                        <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
                            <Typography style={{ fontSize: 13, color: textColor, fontWeight: '600' }}>Change</Typography>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.card, { backgroundColor: cardBgColor }]}>
                        {selectedAddress ? (
                            <View style={{ padding: 20 }}>
                                <Typography style={{ fontSize: 15, fontWeight: '600', color: textColor, marginBottom: 4 }}>
                                    {selectedAddress.full_name}
                                </Typography>
                                <Typography style={{ fontSize: 14, color: subtextColor, lineHeight: 22 }}>
                                    {selectedAddress.address}{'\n'}
                                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                                </Typography>
                                <Typography style={{ fontSize: 13, color: subtextColor, marginTop: 8, fontWeight: '500' }}>
                                    Phone: {selectedAddress.phone}
                                </Typography>
                            </View>
                        ) : (
                            <TouchableOpacity style={{ padding: 20, alignItems: 'center' }} onPress={() => navigation.navigate('ShippingAddress')}>
                                <Ionicons name="location-outline" size={32} color={subtextColor} style={{ marginBottom: 8 }} />
                                <Typography style={{ fontSize: 14, color: subtextColor, fontWeight: '500' }}>Please select a delivery address</Typography>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Order Summary */}
                    <Typography style={styles.sectionTitle}>Order Summary</Typography>
                    <View style={[styles.card, { backgroundColor: cardBgColor }]}>
                        {items.map((item, i) => (
                            <View key={item.id} style={[styles.summaryRow, i < items.length - 1 && [styles.summaryRowBorder, { borderBottomColor: borderColor }]]}>
                                <View style={{ flex: 1 }}>
                                    <Typography style={[styles.itemName, { color: textColor }]} numberOfLines={1}>{item.name}</Typography>
                                    <Typography style={[styles.itemMeta, { color: subtextColor }]}>{item.size} · {item.color} · Qty {item.quantity}</Typography>
                                </View>
                                <Typography style={[styles.itemPrice, { color: textColor }]}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>
                            </View>
                        ))}
                        <View style={[styles.divider, { backgroundColor: borderColor }]} />
                        <View style={styles.totalSummaryRow}><Typography style={[styles.totalLabel, { color: subtextColor }]}>Subtotal</Typography><Typography style={[styles.totalSummaryValue, { color: textColor }]}>₹{subtotal.toLocaleString('en-IN')}</Typography></View>
                        <View style={styles.totalSummaryRow}><Typography style={[styles.totalLabel, { color: subtextColor }]}>GST (18%)</Typography><Typography style={[styles.totalSummaryValue, { color: textColor }]}>₹{Math.round(tax).toLocaleString('en-IN')}</Typography></View>
                        <View style={styles.totalSummaryRow}><Typography style={[styles.totalLabel, { color: subtextColor }]}>Shipping</Typography><Typography style={[styles.totalSummaryValue, { color: textColor }]}>{shipping === 0 ? 'Free' : `₹${shipping}`}</Typography></View>
                        <View style={[styles.divider, { backgroundColor: borderColor }]} />
                        <View style={styles.totalSummaryRow}>
                            <Typography style={[styles.grandTotalLabel, { color: textColor }]}>Total</Typography>
                            <Typography style={[styles.grandTotalValue, { color: textColor }]}>₹{finalTotal.toLocaleString('en-IN')}</Typography>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Sticky CTA */}
            <View style={[styles.ctaContainer, { backgroundColor: ctaBg, borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <TouchableOpacity
                    onPress={handleProceedToPayment}
                    style={styles.ctaButton}
                    activeOpacity={0.9}
                    disabled={isLoading}
                >
                    <LinearGradient colors={['#000', '#1a1a1a']} style={styles.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        {isLoading
                            ? <ActivityIndicator color={textColor} />
                            : <Typography style={styles.ctaText}>Pay  ₹{finalTotal.toLocaleString('en-IN')}</Typography>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 20 },
    sectionTitle: {
        fontSize: 13, fontWeight: '700', color: '#999',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8,
    },
    card: {
        backgroundColor: '#fff', borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
        marginBottom: 24, overflow: 'hidden',
    },
    inputWrapper: { paddingHorizontal: 20, paddingVertical: 14 },
    inputBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    inputLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' },
    input: { fontSize: 15, color: '#000', fontWeight: '400', padding: 0 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    summaryRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemName: { fontSize: 14, fontWeight: '500', color: '#000' },
    itemMeta: { fontSize: 12, color: '#999', marginTop: 2 },
    itemPrice: { fontSize: 14, fontWeight: '600', color: '#000', marginLeft: 12 },
    divider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 4 },
    totalSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
    totalLabel: { fontSize: 13, color: '#666' },
    totalSummaryValue: { fontSize: 13, color: '#000', fontWeight: '500' },
    grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
    grandTotalValue: { fontSize: 20, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
    ctaContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24, paddingTop: 16,
        backgroundColor: 'rgba(250,250,250,0.95)',
        borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)',
    },
    ctaButton: { height: 56, borderRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 },
    ctaGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    ctaText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center', justifyContent: 'center', zIndex: 10,
    },
});
