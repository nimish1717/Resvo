const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redis = require('./lib/redisClient');

async function run() {
    const rnd = Math.floor(Math.random() * 100000);
    console.log(`\n--- Test Run Cache ${rnd} ---`);
    
    // Clear the cache first to ensure a clean state
    await redis.del('halls:approved');

    const admin = await prisma.users.create({ data: { name: 'Admin', email: `admin${rnd}@test.com`, password_hash: 'hash' } });
    const superAdmin = await prisma.users.create({ data: { name: 'SuperAdmin', email: `superadmin${rnd}@test.com`, password_hash: 'hash' } });
    
    const adminToken = jwt.sign({ userId: admin.id, email: admin.email, isSuperAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const superAdminToken = jwt.sign({ userId: superAdmin.id, email: superAdmin.email, isSuperAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log("1. GET /halls (Should be DB)");
    let res1 = await fetch('http://localhost:4000/halls');
    let data1 = await res1.json();
    console.log(`Source: ${data1.source}, Halls count: ${data1.halls.length}`);

    console.log("2. GET /halls again (Should be CACHE)");
    let res2 = await fetch('http://localhost:4000/halls');
    let data2 = await res2.json();
    console.log(`Source: ${data2.source}, Halls count: ${data2.halls.length}`);

    console.log("3. Create org, approve it, add hall");
    let orgRes = await fetch('http://localhost:4000/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ name: `Org ${rnd}` })
    });
    let orgData = await orgRes.json();
    
    await fetch(`http://localhost:4000/api/organizations/${orgData.organization.id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });

    await fetch('http://localhost:4000/halls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ organizationId: orgData.organization.id, name: `Hall ${rnd}`, capacity: 100, pricePerSlot: 500, venueTier: 'standard', locationArea: 'TestArea' })
    });

    console.log("4. GET /halls again (Should be DB, cache busted, new hall visible)");
    let res3 = await fetch('http://localhost:4000/halls');
    let data3 = await res3.json();
    console.log(`Source: ${data3.source}, Halls count: ${data3.halls.length}`);

    const hasNewHall = data3.halls.some(h => h.name === `Hall ${rnd}`);
    console.log(`New hall visible? ${hasNewHall}`);
    
    process.exit(0);
}
run();
