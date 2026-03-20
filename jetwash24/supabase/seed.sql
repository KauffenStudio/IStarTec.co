-- ============================================================
-- Seed: Jetwash24 service catalog (from PROJECT.md)
-- ============================================================
INSERT INTO services (slug, name_pt, name_en, desc_pt, desc_en, duration_min, base_price, sort_order)
VALUES
  ('interior-express',   'Lavagem Interior Express',     'Express Interior Wash',
   'Aspiracao + tablier + plasticos',                    'Vacuuming + dashboard + plastics',
   30, 15.00, 1),

  ('exterior-express',   'Lavagem Exterior Express',     'Express Exterior Wash',
   'Carro completo + jantes + motor',                    'Full exterior + rims + engine bay',
   45, 15.00, 2),

  ('exterior-premium',   'Lavagem Exterior Premium',     'Premium Exterior Wash',
   'Express + polimento farois + remocao riscos',        'Express + headlight polish + scratch removal',
   90, 30.00, 3),

  ('exterior-interior',  'Exterior + Interior Express',  'Exterior + Interior Express',
   'Ambas as lavagens express',                          'Both express washes combined',
   75, 25.00, 4),

  ('interior-premium',   'Pacote Interior Premium',      'Premium Interior Package',
   'Todos os extras incluidos',                          'All extras included',
   120, 75.00, 5),

  ('full-detailing',     'Full Detailing',               'Full Detailing',
   'Tudo incluido',                                      'Everything included',
   150, 110.00, 6);

-- ============================================================
-- Seed: Vehicle type surcharges (from PROJECT.md)
-- ============================================================
INSERT INTO vehicle_surcharges (vehicle_type, surcharge)
VALUES
  ('citadino', 0.00),
  ('berlina',  5.00),
  ('suv',      10.00),
  ('carrinha', 15.00);
