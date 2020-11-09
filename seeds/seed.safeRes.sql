TRUNCATE
  safeRes_restaurant,
  safeRes_guest,
  safeRes_res
  RESTART IDENTITY CASCADE;

INSERT INTO safeRes_restaurant (restaurant_name, email, password)
VALUES
  ('DEMO', 'foo@bar.com', '$2y$12$b0xFftaz8oDBPzN4.H5gBeMk9UjwA9HEeKyxA/HK.L/FwRGpqARg2');

INSERT INTO safeRes_guest (phone_number, guest_name)
VALUES
  ('612-123-1234', 'John'),
  ('612-789-7890', 'Jeb'),
  ('612-456-4567', 'Jeff'),
  ('612-743-3196', 'AJ'),
  ('612-321-3210', 'Jane'),
  ('612-654-6543', 'Jordan'),
  ('612-987-9876', 'Joffrey'),
  ('612-852-8520', 'Lauren');

INSERT INTO safeRes_res (guest_name, phone_number, party_size, res_time, notes)
VALUES
  ('John', '612-123-1234', 2, '16:00', ''),
  ('Jeb', '612-789-7890', 2, '16:00', 'bar'),
  ('Jeff', '612-456-4567', 2, '17:00', 'bar'),
  ('AJ', '612-743-3196', 2, '17:00', 'bar'),
  ('Jane', '612-321-3210', 3, '17:30', ''),
  ('Jordan', '612-654-6543', 4, '18:00', 'low top'),
  ('Joffrey', '612-987-9876', 2, '18:00', 'booth'),
  ('Lauren', '612-852-8520', 1, '18:30', 'bar');