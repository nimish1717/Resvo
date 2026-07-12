#!/bin/bash
set -e

# Restart server
node server.js &
SERVER_PID=$!
sleep 2

echo "--- 1. Login ---"
LOGIN_RES=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{ "email": "admin@resvo.com", "password": "adminpassword" }')
TOKEN=$(echo $LOGIN_RES | jq -r .token)

echo "--- 2. Create Hall ---"
HALL_RES=$(curl -s -X POST http://localhost:4000/api/halls -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{ "name": "Cascade Hall", "capacity": 100, "base_price": 500, "venue_tier": "standard", "organization_id": "76162232-a430-4e04-afbc-edb186b51fb3" }')
# Wait, I don't know an existing org ID. Let's fetch one.
