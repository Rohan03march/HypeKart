import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PaymentMethodType = 'all' | 'upi' | 'card' | 'wallet' | 'netbanking';

export interface PaymentMethodOption {
    id: PaymentMethodType;
    label: string;
    icon: string; // Ionicons name
    description: string;
}

export const PAYMENT_OPTIONS: PaymentMethodOption[] = [
    { id: 'all', label: 'Ask Every Time', icon: 'grid-outline', description: 'Show all payment options via Razorpay' },
    { id: 'upi', label: 'UPI / QR', icon: 'scan-outline', description: 'Google Pay, PhonePe, Paytm, etc.' },
    { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Netbanking', icon: 'business-outline', description: 'All major Indian banks' },
    { id: 'wallet', label: 'Wallets', icon: 'wallet-outline', description: 'Amazon Pay, MobiKwik, Freecharge' },
];

interface PaymentState {
    preferredMethodId: PaymentMethodType;
    setPreferredMethod: (methodId: PaymentMethodType) => void;
}

export const usePaymentStore = create<PaymentState>()(
    persist(
        (set) => ({
            preferredMethodId: 'all',
            setPreferredMethod: (methodId) => set({ preferredMethodId: methodId }),
        }),
        {
            name: 'hypekart-payment-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
