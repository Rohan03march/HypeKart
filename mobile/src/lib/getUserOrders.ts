const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Fetches all orders for a given Clerk user ID via the backend API.
 * Uses supabaseAdmin on the server side, which bypasses Supabase RLS.
 * This is required because the anon key cannot read the orders table.
 */
export async function getUserOrders(clerkUserId: string): Promise<any[]> {
    try {
        const res = await fetch(`${API_URL}/user/orders?clerk_user_id=${encodeURIComponent(clerkUserId)}`);

        // Guard against HTML error pages (non-JSON responses)
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            console.error('[getUserOrders] Non-JSON response from API');
            return [];
        }

        const data = await res.json();
        return data.orders || [];
    } catch (e) {
        console.error('[getUserOrders] error:', e);
        return [];
    }
}
