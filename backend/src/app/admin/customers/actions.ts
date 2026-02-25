"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteCustomerAction(clerkId: string) {
    try {
        const client = await clerkClient();
        await client.users.deleteUser(clerkId);
        // The clerk webhook will automatically process this and delete from Supabase
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { success: false, error: error.message };
    }
}

export async function banCustomerAction(clerkId: string) {
    try {
        const client = await clerkClient();
        await client.users.banUser(clerkId);
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error: any) {
        console.error("Error banning user:", error);
        return { success: false, error: error.message };
    }
}

export async function unbanCustomerAction(clerkId: string) {
    try {
        const client = await clerkClient();
        await client.users.unbanUser(clerkId);
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error: any) {
        console.error("Error unbanning user:", error);
        return { success: false, error: error.message };
    }
}
