TRUNCATE
  saferes_restaurant,
  saferes_guest,
  saferes_res,
  saferes_daily_counts
  RESTART IDENTITY CASCADE;

INSERT INTO saferes_restaurant (restaurant_name, email, password)
VALUES
  ('DEMO', 'foo@bar.com', '$2y$12$b0xFftaz8oDBPzN4.H5gBeMk9UjwA9HEeKyxA/HK.L/FwRGpqARg2');

INSERT INTO saferes_guest (phone_number, guest_name, restaurant_id)
VALUES
  ('612-123-1234', 'John', 1),
  ('612-789-7890', 'Jeb', 1),
  ('612-456-4567', 'Jeff', 1),
  ('612-743-3196', 'AJ', 1),
  ('612-321-3210', 'Jane', 1),
  ('612-654-6543', 'Jordan', 1),
  ('612-987-9876', 'Joffrey', 1),
  ('612-852-8520', 'Lauren', 1);

INSERT INTO saferes_res (restaurant_id, guest_name, phone_number, party_size, res_time, notes, res_date)
VALUES
  (1, 'John', '612-123-1234', 2, '16:00', '', '3352020'),
  (1, 'Jeb', '612-789-7890', 2, '16:00', 'bar', '3352020'),
  (1, 'Jeff', '612-456-4567', 2, '17:00', 'bar', '3352020'),
  (1, 'AJ', '612-743-3196', 2, '17:00', 'bar', '3352020'),
  (1, 'Jane', '612-321-3210', 3, '17:30', '', '3352020'),
  (1, 'Jordan', '612-654-6543', 4, '18:00', 'low top', '3352020'),
  (1, 'Joffrey', '612-987-9876', 2, '18:00', 'booth', '3352020'),
  (1, 'Lauren', '612-852-8520', 1, '18:30', 'bar', '3352020');

INSERT INTO saferes_daily_counts (restaurant_id, res_day, res_week, res_month, res_year, res_weekday)
VALUES 
  (1, '3352020', '492020', '112020', '2020', '1');