INSERT INTO plans (name, slug, description, price_monthly, price_yearly, price_min, price_max, currency, max_professionals, max_units, max_clients, max_appointments_per_month, features, highlight_label, display_order, color, is_active, is_visible, trial_days, created_at, updated_at) 
VALUES (
    'Plano Básico', 
    'basico', 
    'Plano básico para pequenas empresas', 
    99.00, 
    990.00, 
    99.00, 
    990.00, 
    'BRL', 
    5, 
    1, 
    100, 
    1000, 
    '{"appointments": true, "professionals": true, "clients": true}', 
    null, 
    1, 
    '#3B82F6', 
    true, 
    true, 
    7, 
    NOW(), 
    NOW()
) RETURNING id;
