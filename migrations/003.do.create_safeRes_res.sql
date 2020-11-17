CREATE TABLE saferes_res (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    restaurant_id INTEGER REFERENCES safeRes_restaurant(id),
    guest_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    party_size INTEGER NOT NULL,
    res_date TIMESTAMPTZ DEFAULT now() NOT NULL,
    res_time TIME NOT NULL,
    notes TEXT,
    walk_in BOOLEAN DEFAULT false,
    no_show BOOLEAN DEFAULT false,
    arrived BOOLEAN DEFAULT false,
    cancelled BOOLEAN DEFAULT false,
    notified BOOLEAN DEFAULT false,
    waiting BOOLEAN DEFAULT false
);