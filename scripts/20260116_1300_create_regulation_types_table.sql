-- Author: Copilot
-- Ticket: TBD

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS public.regulation_types (
  code text PRIMARY KEY,
  name text NOT NULL
);

INSERT INTO public.regulation_types (code, name) VALUES
  ('DECREE', 'Decreto'),
  ('RESOLUTION', 'Resolución'),
  ('ORDINANCE', 'Ordenanza'),
  ('TRIBUNAL_RESOLUTION', 'Resolución Tribunal'),
  ('BID', 'Licitación')
ON CONFLICT (code) DO NOTHING;

-- Update regulations.type to reference the catalog instead of a CHECK constraint
ALTER TABLE public.regulations DROP CONSTRAINT IF EXISTS regulations_type_check;
ALTER TABLE public.regulations
  ADD CONSTRAINT regulations_type_fkey
  FOREIGN KEY (type) REFERENCES public.regulation_types(code)
  ON UPDATE CASCADE;

COMMIT;
