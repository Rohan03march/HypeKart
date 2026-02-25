import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
    const SIGNING_SECRET = process.env.SIGNING_SECRET

    if (!SIGNING_SECRET) {
        throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET)

    // Get headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', {
            status: 400,
        })
    }

    // Get body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    let evt: WebhookEvent

    // Verify payload with headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error: Could not verify webhook:', err)
        return new Response('Error: Verification error', {
            status: 400,
        })
    }

    // Handle User Created Event
    if (evt.type === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata, created_at } = evt.data
        const email = email_addresses?.[0]?.email_address

        // Name fallback logic (mobile app saves to unsafe_metadata)
        const metaName = unsafe_metadata?.name as string | undefined;
        let full_name = metaName || [first_name, last_name].filter(Boolean).join(' ') || null;
        if (full_name && full_name.trim() === '') full_name = null;

        // Onboarding completed flag (anyone registered via Clerk is successfully logged in)
        const onboarding_completed = true;

        if (email) {
            const uuid = crypto.randomUUID()
            const { error } = await supabaseAdmin.from('users').insert({
                id: uuid, // Must be UUID
                clerk_id: id, // Store Clerk ID here
                email: email,
                full_name: full_name,
                avatar_url: image_url,
                role: 'customer',
                onboarding_completed: onboarding_completed,
                created_at: new Date(created_at).toISOString()

            })
            if (error) {
                console.error('Error inserting user to Supabase:', error)
                return new Response('Error inserting user to database', { status: 500 })
            }
        }
    }

    // Handle User Updated Event
    if (evt.type === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = evt.data
        const email = email_addresses?.[0]?.email_address

        // Name fallback logic
        const metaName = unsafe_metadata?.name as string | undefined;
        let full_name = metaName || [first_name, last_name].filter(Boolean).join(' ') || null;
        if (full_name && full_name.trim() === '') full_name = null;

        // Onboarding completed flag (anyone registered via Clerk is successfully logged in)
        const onboarding_completed = true;

        if (email) {
            const { error } = await supabaseAdmin
                .from('users')
                .update({
                    email: email,
                    full_name: full_name,
                    avatar_url: image_url,
                    onboarding_completed: onboarding_completed
                })
                .eq('clerk_id', id)

            if (error) {
                console.error('Error updating user in Supabase:', error)
                return new Response('Error updating user in database', { status: 500 })
            }
        }
    }

    // Handle User Deleted Event
    if (evt.type === 'user.deleted') {
        const { id } = evt.data
        if (id) {
            const { error } = await supabaseAdmin
                .from('users')
                .delete()
                .eq('clerk_id', id)

            if (error) {
                console.error('Error deleting user in Supabase:', error)
                return new Response('Error deleting user from database', { status: 500 })
            }
        }
    }

    return new Response('Webhook received', { status: 200 })
}
