import { create } from 'zustand';

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

interface CacheState {
    products: Record<string, CacheItem<any[]>>; // Keyed by categoryId
    orders: Record<string, CacheItem<any[]>>; // Keyed by userId
    setProducts: (categoryId: string, data: any[]) => void;
    setOrders: (userId: string, data: any[]) => void;
    getProducts: (categoryId: string, ttlMs?: number) => any[] | null;
    getOrders: (userId: string, ttlMs?: number) => any[] | null;
    clearCache: () => void;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useCacheStore = create<CacheState>((set, get) => ({
    products: {},
    orders: {},
    setProducts: (categoryId, data) => set(state => ({
        products: { ...state.products, [categoryId]: { data, timestamp: Date.now() } }
    })),
    setOrders: (userId, data) => set(state => ({
        orders: { ...state.orders, [userId]: { data, timestamp: Date.now() } }
    })),
    getProducts: (categoryId, ttlMs = DEFAULT_TTL) => {
        const item = get().products[categoryId];
        if (!item) return null;
        if (Date.now() - item.timestamp > ttlMs) return null; // Cache expired
        return item.data;
    },
    getOrders: (userId, ttlMs = DEFAULT_TTL) => {
        const item = get().orders[userId];
        if (!item) return null;
        if (Date.now() - item.timestamp > ttlMs) return null; // Cache expired
        return item.data;
    },
    clearCache: () => set({ products: {}, orders: {} })
}));
