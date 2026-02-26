import { create } from 'zustand';

export interface WishlistItem {
    id: string;
    title: string;
    brand: string;
    price: number;
    image: string;
    // Full product fields for navigating to ProductDetails
    images?: string[];
    description?: string;
    sizes?: string[];
    colors?: string[];
}

interface WishlistState {
    items: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    isWishlisted: (id: string) => boolean;
    toggle: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],

    addItem: (item) => {
        set((state) => {
            if (state.items.find(i => i.id === item.id)) return state;
            return { items: [...state.items, item] };
        });
    },

    removeItem: (id) => {
        set((state) => ({ items: state.items.filter(i => i.id !== id) }));
    },

    isWishlisted: (id) => {
        return !!get().items.find(i => i.id === id);
    },

    toggle: (item) => {
        const exists = get().isWishlisted(item.id);
        if (exists) {
            get().removeItem(item.id);
        } else {
            get().addItem(item);
        }
    },
}));
