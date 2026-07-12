const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const rnd = Math.floor(Math.random() * 100000);
    console.log(`\n--- Test Run ${rnd} ---`);
    
    const admin = await prisma.users.create({ data: { name: 'Admin', email: `admin${rnd}@test.com`, password_hash: 'hash' } });
    const user = await prisma.users.create({ data: { name: 'User', email: `user${rnd}@test.com`, password_hash: 'hash' } });
    const stranger = await prisma.users.create({ data: { name: 'Stranger', email: `stranger${rnd}@test.com`, password_hash: 'hash' } });
    
    const adminToken = jwt.sign({ userId: admin.id, email: admin.email, isSuperAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const userToken = jwt.sign({ userId: user.id, email: user.email, isSuperAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const strangerToken = jwt.sign({ userId: stranger.id, email: stranger.email, isSuperAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const org = await prisma.organizations.create({ data: { name: `Org ${rnd}`, status: 'approved', users: { connect: { id: admin.id } } } });
    await prisma.organization_members.create({ data: { organization_id: org.id, user_id: admin.id, role: 'org_admin' } });
    const hall = await prisma.halls.create({ data: { name: `Hall ${rnd}`, capacity: 100, price_per_slot: 500, venue_tier: 'standard', location_area: 'TestArea', organization_id: org.id } });

    console.log("\n1. Set up a genuine conflict");
    const b1Res = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ hallId: hall.id, startTime: '2026-10-10T10:00:00Z', endTime: '2026-10-10T12:00:00Z' })
    });
    const b1 = await b1Res.json();
    await fetch(`http://localhost:4000/api/bookings/${b1.booking.id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const b2Res = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ hallId: hall.id, startTime: '2026-10-10T10:00:00Z', endTime: '2026-10-10T12:00:00Z' })
    });
    const b2 = await b2Res.json();
    
    const b2ApproveRes = await fetch(`http://localhost:4000/api/bookings/${b2.booking.id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log("Approve Conflicting B2:", await b2ApproveRes.json());
    
    console.log("\n2. Fetch suggestions as the right user");
    const suggRes = await fetch(`http://localhost:4000/api/bookings/${b2.booking.id}/suggestions`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const suggestions = await suggRes.json();
    console.log("Suggestions returned length:", suggestions.suggestions ? suggestions.suggestions.length : 0);
    
    console.log("\n3. Fetch suggestions as STRANGER (Auth check)");
    const strangerSuggRes = await fetch(`http://localhost:4000/api/bookings/${b2.booking.id}/suggestions`, {
        headers: { 'Authorization': `Bearer ${strangerToken}` }
    });
    console.log("Stranger suggestions response:", await strangerSuggRes.json());
    
    console.log("\n4. Confirm hold was actually created in DB");
    const holds = await prisma.$queryRaw`SELECT id, hall_id, held_for_booking_id, expires_at FROM suggestion_holds WHERE held_for_booking_id = ${b2.booking.id}::uuid`;
    console.log(`Holds found in DB: ${holds.length}`);
    if (holds.length > 0) {
        console.log(`Expires at: ${holds[0].expires_at}`);
    }

    console.log("\n6. The real edge case - Try accepting with FAKE random time slot");
    const fakeAcceptRes = await fetch(`http://localhost:4000/api/bookings/${b2.booking.id}/accept-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ hallId: hall.id, startTime: '2026-10-10T12:15:00Z', endTime: '2026-10-10T14:15:00Z' })
    });
    console.log("Fake Accept Response:", await fakeAcceptRes.json());

    console.log("\n5. Accept one suggestion legitimately");
    const sugg = suggestions.suggestions[0];
    const acceptRes = await fetch(`http://localhost:4000/api/bookings/${b2.booking.id}/accept-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ hallId: sugg.hall_id, startTime: sugg.start_time, endTime: sugg.end_time })
    });
    const acceptData = await acceptRes.json();
    console.log("Valid Accept Response:", acceptData.status ? "Success" : acceptData);
    
    const finalB2Res = await fetch(`http://localhost:4000/api/bookings/${b2.booking.id}`, { headers: { 'Authorization': `Bearer ${userToken}` } });
    const finalB2 = await finalB2Res.json();
    console.log(`Original Booking status: ${finalB2.booking.status}, superseded_by: ${finalB2.booking.superseded_by}`);
    
    console.log("\n7. Push booking to round cap (Round 2)");
    const b4Id = acceptData.newBookingId;
    
    const b4SuggRes = await fetch(`http://localhost:4000/api/bookings/${b4Id}/suggestions`, { headers: { 'Authorization': `Bearer ${userToken}` } });
    const b4Sugg = await b4SuggRes.json();
    
    const accB4Res = await fetch(`http://localhost:4000/api/bookings/${b4Id}/accept-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ hallId: b4Sugg.suggestions[0].hall_id, startTime: b4Sugg.suggestions[0].start_time, endTime: b4Sugg.suggestions[0].end_time })
    });
    const b6Id = (await accB4Res.json()).newBookingId;
    
    const capSuggRes = await fetch(`http://localhost:4000/api/bookings/${b6Id}/suggestions`, { headers: { 'Authorization': `Bearer ${userToken}` } });
    console.log("Round Cap Response:", await capSuggRes.json());
    
    console.log("\n8. Test decline");
    const decRes = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ hallId: hall.id, startTime: '2026-10-12T10:00:00Z', endTime: '2026-10-12T12:00:00Z' })
    });
    const decB = await decRes.json();
    const decAction = await fetch(`http://localhost:4000/api/bookings/${decB.booking.id}/decline-suggestions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const decActionData = await decAction.json();
    
    const finalDecRes = await fetch(`http://localhost:4000/api/bookings/${decB.booking.id}`, { headers: { 'Authorization': `Bearer ${userToken}` } });
    const finalDecData = await finalDecRes.json();
    console.log(`Decline Action Response:`, decActionData);
    console.log(`Declined Booking Status: ${finalDecData.booking.status}, Reason: ${finalDecData.booking.reason}`);
}
run();
