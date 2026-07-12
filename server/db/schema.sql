CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- needed for gen_random_uuid()

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT,
    password_hash TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organizations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id),
    name          TEXT NOT NULL,
    status        TEXT NOT NULL CHECK (status IN
                    ('pending','approved','rejected','changes_requested','suspended'))
                    DEFAULT 'pending',
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE halls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name            TEXT NOT NULL,
    location_area   TEXT NOT NULL,
    capacity        INT NOT NULL,
    venue_tier      TEXT NOT NULL CHECK (venue_tier IN ('budget','standard','premium')),
    price_per_slot  NUMERIC NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organization_members (
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    role            TEXT NOT NULL CHECK (role IN ('org_admin','co_admin')),
    PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE bookings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id           UUID NOT NULL REFERENCES halls(id),
    requested_by      UUID NOT NULL REFERENCES users(id),
    status            TEXT NOT NULL CHECK (status IN
                        ('requested','approved','active','completed','rejected','conflicted','expired','cancelled'))
                        DEFAULT 'requested',
    time_range        TSTZRANGE NOT NULL,
    response_deadline TIMESTAMPTZ DEFAULT now() + interval '48 hours',
    suggestion_round  INT DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT now(),

    -- The core guarantee: no two approved/active bookings can overlap on the same hall
    EXCLUDE USING GIST (
        hall_id WITH =,
        time_range WITH &&
    ) WHERE (status IN ('approved','active'))
);

CREATE TABLE booking_actions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id     UUID NOT NULL REFERENCES bookings(id),
    acting_user_id UUID NOT NULL REFERENCES users(id),
    action         TEXT NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT now()
);