import { create } from 'zustand';

export interface CartItem {
    id: string; // Combine productId-size-color for unique cart row
    productId: string;
    name: string;
    price: number;
    image: string;
    size?: string;
    color?: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (newItem) => {
        set((state) => {
            // Create a unique ID based on product, size, and color
            const uniqueId = `${newItem.productId}-${newItem.size || 'default'}-${newItem.color || 'default'}`;

            const existingItemIndex = state.items.findIndex(item => item.id === uniqueId);

            if (existingItemIndex > -1) {
                // Increment quantity if exact variant already exists
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex].quantity += newItem.quantity;
                return { items: updatedItems };
            }

            // Otherwise add as new cart item
            return {
                items: [...state.items, { ...newItem, id: uniqueId }]
            };
        });
    },

    removeItem: (id) => {
        set((state) => ({
            items: state.items.filter((item) => item.id !== id),
        }));
    },

    updateQuantity: (id, quantity) => {
        // Minimum quantity is 1 — use removeItem (X button) to fully remove
        const clamped = Math.max(1, quantity);
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, quantity: clamped } : item
            ),
        }));
    },

    clearCart: () => set({ items: [] }),

    getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    }
}));
