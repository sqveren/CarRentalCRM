BEGIN;

TRUNCATE TABLE
  public.fines,
  public.payments,
  public.rental_services,
  public.rentals,
  public.cars,
  public.car_categories,
  public.clients,
  public.employees,
  public.roles,
  public.services
RESTART IDENTITY CASCADE;

INSERT INTO public.roles (name) VALUES
  ('admin'),
  ('manager'),
  ('operator');

INSERT INTO public.employees (first_name, last_name, role_id, login, password_hash) VALUES
  ('Ivan', 'Petrenko', 1, 'admin', '$2b$10$adminHashExample1234567890'),
  ('Olena', 'Koval', 2, 'manager', '$2b$10$managerHashExample123456'),
  ('Maksym', 'Shevchenko', 3, 'operator1', '$2b$10$operatorHashExample12345'),
  ('Iryna', 'Melnyk', 3, 'operator2', '$2b$10$operatorHashExample67890'),
  ('Andrii', 'Bondarenko', 2, 'manager2', '$2b$10$managerHashExample654321');

INSERT INTO public.clients (first_name, last_name, phone, email, document_number) VALUES
  ('John', 'Doe', '+1-555-0101', 'john.doe@email.com', 'DL-100001'),
  ('Jane', 'Smith', '+1-555-0102', 'jane.smith@email.com', 'DL-100002'),
  ('Michael', 'Johnson', '+1-555-0103', 'michael.j@email.com', 'DL-100003'),
  ('Emily', 'Brown', '+1-555-0104', 'emily.brown@email.com', 'DL-100004'),
  ('David', 'Wilson', '+1-555-0105', 'david.w@email.com', 'DL-100005');

INSERT INTO public.car_categories (name, price_per_day) VALUES
  ('Economy', 35.00),
  ('Sedan', 50.00),
  ('SUV', 85.00),
  ('Luxury', 120.00),
  ('Van', 95.00);

INSERT INTO public.cars (brand, model, manufacture_year, mileage, status, category_id) VALUES
  ('Toyota', 'Yaris', 2022, 18000, 'available', 1),
  ('Honda', 'Accord', 2023, 12000, 'available', 2),
  ('Ford', 'Explorer', 2021, 27000, 'available', 3),
  ('BMW', '5 Series', 2024, 8000, 'available', 4),
  ('Mercedes-Benz', 'V-Class', 2022, 22000, 'available', 5);

INSERT INTO public.services (name, price) VALUES
  ('GPS Navigation', 10.00),
  ('Child Seat', 15.00),
  ('WiFi Hotspot', 12.00);

INSERT INTO public.rentals (
  client_id,
  car_id,
  employee_id,
  start_date,
  end_date,
  start_mileage,
  end_mileage,
  status
) VALUES
  (1, 1, 3, '2026-04-01 09:00:00', '2026-04-04 09:00:00', 18000, NULL, 'active'),
  (2, 2, 2, '2026-04-02 10:00:00', '2026-04-06 10:00:00', 12000, NULL, 'active'),
  (3, 3, 3, '2026-04-03 08:30:00', '2026-04-08 08:30:00', 27000, NULL, 'active'),
  (4, 4, 2, '2026-04-04 12:00:00', '2026-04-06 12:00:00', 8000, NULL, 'pending'),
  (5, 5, 3, '2026-04-05 14:00:00', '2026-04-10 14:00:00', 22000, NULL, 'active');

INSERT INTO public.rental_services (rental_id, service_id) VALUES
  (1, 1),
  (1, 2),
  (2, 2),
  (2, 3),
  (3, 1),
  (4, 3),
  (5, 1),
  (5, 2);

INSERT INTO public.payments (rental_id, amount, payment_date) VALUES
  (1, 150.00, '2026-04-01 09:05:00'),
  (2, 200.00, '2026-04-02 10:10:00'),
  (3, 425.00, '2026-04-03 08:40:00'),
  (4, 170.00, '2026-04-04 12:15:00'),
  (5, 475.00, '2026-04-05 14:10:00');

INSERT INTO public.fines (rental_id, description, amount) VALUES
  (1, 'Late return warning fee', 40.00),
  (2, 'Interior cleaning surcharge', 25.00),
  (3, 'Speed camera penalty reimbursement', 90.00),
  (4, 'Parking violation reimbursement', 35.00),
  (5, 'Minor body scratch processing fee', 120.00);

COMMIT;
