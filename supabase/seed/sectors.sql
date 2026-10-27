
insert into sectors (sector_code, sector_name, definition) values
('poultry','Aviculture', (select definition from jsonb_to_recordset('[{"dummy":1}]'::jsonb) as x(dummy int)) ),
('anacarde','Anacarde / Cajou', '{}'::jsonb)
on conflict (sector_code) do nothing;
-- Les définitions complètes sont chargées via supabase/functions/seed-sectors
