CREATE TABLE saferes_daily_counts (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    res_day TEXT not null,
    res_week TEXT not null,
    res_month TEXT not null,
    res_year TEXT not null,
    res_weekday TEXT NOT NULL,
    unique_parties INTEGER DEFAULT 0,
    walk_ins INTEGER DEFAULT 0,
    no_shows INTEGER DEFAULT 0,
    cancellations INTEGER DEFAULT 0,
    head_count INTEGER DEFAULT 0
);