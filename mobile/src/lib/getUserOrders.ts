import { supabase } from './supabase';

/**
 * Fetches all orders for a given Clerk user ID.
 * Queries the orders table directly by clerk_user_id column.
 * Requires the DB migration (fix_orders_clerk_id.sql) to have been run.
 */
export async function getUserOrders(clerkUserId: string): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at, order_items, shipping_address, payment_id')
            .eq('clerk_user_id', clerkUserId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[getUserOrders] error:', error.message);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('[getUserOrders] unexpected error:', e);
        return [];
    }
}
