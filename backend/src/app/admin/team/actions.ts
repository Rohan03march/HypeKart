'use server';

import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function revokeAdminAccessAction(userId: string) {
    try {
        // Find the user first
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('clerk_id, role')
            .eq('id', userId)
            .single();

        if (fetchError || !user) {
            throw new Error("User not found");
        }

        if (user.role !== 'admin') {
            throw new Error("User is not an admin");
        }

        // 1. Delete the user from public.users table
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            throw new Error("Failed to remove admin from database");
        }

        // 2. Delete the user from auth.users (Supabase Auth)
        if (user.clerk_id) {
            // clerk_id is storing the auth.users UUID since our refactor
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.clerk_id);
            if (authError) {
                console.error("Failed to delete auth user, but DB record removed:", authError);
                // We'll still continue since DB record is removed and they effectively lose access
            }
        }

        revalidatePath('/admin/team');
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleAdminStatusAction(userId: string, currentStatus: boolean) {
    try {
        const { error } = await supabaseAdmin
            .from('users')
            .update({ onboarding_completed: !currentStatus })
            .eq('id', userId);

        if (error) {
            throw new Error("Failed to update status");
        }

        revalidatePath('/admin/team');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getActiveAdminRoleAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return 'admin'; // fallback

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data) return 'admin'; // fallback
        return data.role;
    } catch (e) {
        return 'admin';
    }
}
