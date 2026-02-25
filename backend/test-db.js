const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://muxjuuuvedqiijupfcrz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eGp1dXV2ZWRxaWlqdXBmY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg2NDg3MSwiZXhwIjoyMDg3NDQwODcxfQ.1_PEZexH3hpr4dhi7liOUEHNQg3QhhR1nqO5OPMxH1A';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
    console.log("Testing insert...");

    // Test inserting a mock admin
    const newUserId = "00000000-0000-0000-0000-000000000001";

    const { error: dbError } = await supabaseAdmin.from('users').insert({
        id: newUserId,
        clerk_id: newUserId,
        email: 'test@admin.com',
        full_name: 'Test Admin',
        role: 'admin',
        onboarding_completed: true
    });

    if (dbError) {
        console.error("DB Error:", JSON.stringify(dbError, null, 2));
    } else {
        console.log("Success!");
    }
}

testInsert();
