import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentSearchState {
    searches: string[];
    addSearch: (query: string) => void;
    clearSearches: () => void;
    removeSearch: (query: string) => void;
}

export const useRecentSearchStore = create<RecentSearchState>()(
    persist(
        (set) => ({
            searches: [],

            addSearch: (query) => set((state) => {
                const trimmed = query.trim();
                // Don't add if empty
                if (!trimmed) return state;

                // Remove it if it already exists so we can bump it to the top
                const filtered = state.searches.filter(s => s.toLowerCase() !== trimmed.toLowerCase());

                // Keep max 10 recent searches
                return { searches: [trimmed, ...filtered].slice(0, 10) };
            }),

            clearSearches: () => set({ searches: [] }),

            removeSearch: (query) => set((state) => ({
                searches: state.searches.filter(s => s !== query)
            })),
        }),
        {
            name: 'hypekart-recent-searches',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
