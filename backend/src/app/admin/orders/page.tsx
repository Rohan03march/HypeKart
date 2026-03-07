import { FileText } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import OrdersTable from "@/components/admin/OrdersTable";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select(`id, total_amount, status, created_at, shipping_address, payment_id`)
        .order('created_at', { ascending: false });

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Orders</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage and fulfill your customer orders.</p>
                </div>
                <button className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-300">
                    <FileText className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            <OrdersTable orders={orders || []} />
        </div>
    );
}
