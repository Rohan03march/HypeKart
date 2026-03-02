import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Address {
    id: string;
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    is_current_location?: boolean;
}

interface AddressState {
    addresses: Address[];
    selectedAddressId: string | null;
    addAddress: (addr: Address) => void;
    updateAddress: (id: string, addr: Partial<Address>) => void;
    removeAddress: (id: string) => void;
    selectAddress: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
    persist(
        (set) => ({
            addresses: [],
            selectedAddressId: null,
            addAddress: (addr) => set((state) => ({
                addresses: [...state.addresses, addr],
                selectedAddressId: state.selectedAddressId || addr.id
            })),
            updateAddress: (id, updated) => set((state) => ({
                addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...updated } : a))
            })),
            removeAddress: (id) => set((state) => ({
                addresses: state.addresses.filter((a) => a.id !== id),
                selectedAddressId: state.selectedAddressId === id
                    ? state.addresses.filter((a) => a.id !== id)[0]?.id || null
                    : state.selectedAddressId
            })),
            selectAddress: (id) => set({ selectedAddressId: id }),
        }),
        {
            name: 'address-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
