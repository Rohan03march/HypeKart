require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CLERK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing environment variables. Make sure .env.local is loaded properly.");
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runSync() {
    console.log("Starting Clerk to Supabase manual sync...");

    try {
        const response = await fetch('https://api.clerk.com/v1/users?limit=100', {
            headers: {
                Authorization: `Bearer ${CLERK_SECRET_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Clerk API error: ${response.statusText}`);
        }

        const users = await response.json();
        console.log(`Fetched ${users.length} users from Clerk.`);

        const { data: existingUsers, error: fetchErr } = await supabaseAdmin.from('users').select('clerk_id');
        if (fetchErr) throw fetchErr;

        const existingClerkIds = new Set(existingUsers?.map(u => u.clerk_id).filter(Boolean) || []);
        console.log(`Found ${existingClerkIds.size} existing users in Supabase.`);

        let addedCount = 0;

        for (const clerkUser of users) {
            if (!existingClerkIds.has(clerkUser.id)) {
                const role = clerkUser.public_metadata?.role || 'customer';
                const emailObj = clerkUser.email_addresses?.find((e) => e.id === clerkUser.primary_email_address_id) || clerkUser.email_addresses?.[0];
                const email = emailObj?.email_address;

                // Name fallback logic (mobile app saves to unsafe_metadata)
                const metaName = clerkUser.unsafe_metadata?.name;
                let full_name = metaName || [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ') || null;
                if (full_name && full_name.trim() === '') full_name = null;

                // Onboarding completed flag (anyone registered via Clerk is successfully logged in)
                const onboarding_completed = true;

                if (email) {
                    const uuid = crypto.randomUUID();
                    const { error: insertErr } = await supabaseAdmin.from('users').insert({
                        id: uuid,
                        clerk_id: clerkUser.id,
                        email: email,
                        full_name: full_name,
                        avatar_url: clerkUser.image_url,
                        role: role,
                        onboarding_completed: onboarding_completed,
                        created_at: new Date(clerkUser.created_at).toISOString()
                    });

                    if (insertErr) {
                        console.error(`Failed to insert user ${email}:`, insertErr);
                    } else {
                        console.log(`Successfully synced user: ${email}`);
                        addedCount++;
                    }
                }
            } else {
                console.log(`User ${clerkUser.id} already exists. Skipping.`);
            }
        }

        console.log(`\nSync complete! Added ${addedCount} missing users to Supabase.`);
    } catch (error) {
        console.error("Sync failed:", error);
    }
}

runSync();
