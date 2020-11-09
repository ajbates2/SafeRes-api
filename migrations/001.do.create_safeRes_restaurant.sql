CREATE TABLE safeRes_restaurant (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    restaurant_name TEXT NOT NULL,
    email TEXT NOT NULL unique,
    password TEXT NOT NULL,
    date_added TIMESTAMP DEFAULT now() NOT NULL
);