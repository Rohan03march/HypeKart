'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const statusColorMap: Record<string, string> = {
    Placed: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
    Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Shipped: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Out for Delivery': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface StatusChangerProps {
    orderId: string;
    currentStatus: string;
}

export default function StatusChanger({ orderId, currentStatus }: StatusChangerProps) {
    const router = useRouter();
    const [selected, setSelected] = useState(currentStatus);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (selected === currentStatus) return;
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/admin/update-order-status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: selected }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
            router.refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSelected(s)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${selected === s
                                ? statusColorMap[s]
                                : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 mt-1">
                <button
                    onClick={handleSave}
                    disabled={saving || selected === currentStatus}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Status'}
                </button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {saved && !error && <p className="text-green-400 text-sm">Status updated!</p>}
            </div>
        </div>
    );
}
