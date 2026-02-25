const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://muxjuuuvedqiijupfcrz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eGp1dXV2ZWRxaWlqdXBmY3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg2NDg3MSwiZXhwIjoyMDg3NDQwODcxfQ.1_PEZexH3hpr4dhi7liOUEHNQg3QhhR1nqO5OPMxH1A';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    const fetch = globalThis.fetch;
    const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseServiceKey}`;
    try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${supabaseServiceKey}` } });
        const data = await response.json();
        console.log("Supabase Tables API Root:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
listTables();
