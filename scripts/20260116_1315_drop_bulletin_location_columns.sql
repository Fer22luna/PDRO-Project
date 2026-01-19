-- Author: Copilot
-- Ticket: TBD

BEGIN TRANSACTION;

-- Drop municipality, department, location columns if they exist in regulations or bulletin tables
ALTER TABLE IF EXISTS public.regulations DROP COLUMN IF EXISTS municipality;
ALTER TABLE IF EXISTS public.regulations DROP COLUMN IF EXISTS department;
ALTER TABLE IF EXISTS public.regulations DROP COLUMN IF EXISTS location;

ALTER TABLE IF EXISTS public.bulletins DROP COLUMN IF EXISTS municipality;
ALTER TABLE IF EXISTS public.bulletins DROP COLUMN IF EXISTS department;
ALTER TABLE IF EXISTS public.bulletins DROP COLUMN IF EXISTS location;

COMMIT;
