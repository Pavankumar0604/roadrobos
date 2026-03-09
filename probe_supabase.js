
const URL = 'https://wdjyombcrvaayhqszyhe.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkanlvbWJjcnZhYXlocXN6eWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzQzNzIsImV4cCI6MjA4MDYxMDM3Mn0.Uk8F1579EUXW58KJp1fIQr3QEQyMYso-KRWJGwjAkQ0';

async function probe(endpoint, params) {
    try {
        const res = await fetch(`${URL}/${endpoint}?${params}`, {
            headers: {
                'apikey': KEY,
                'Authorization': `Bearer ${KEY}`,
                'Range': '0-0'
            }
        });
        const body = await res.text();
        console.log(`PROBE ${endpoint}?${params} -> ${res.status} ${res.statusText}`);
    } catch (e) {
        console.log(`FETCH FAILED: ${e.message}`);
    }
}

async function run() {
    await probe('bookings', 'status=eq.accepted');
    await probe('bookings', 'status=eq.started');
}

run();
