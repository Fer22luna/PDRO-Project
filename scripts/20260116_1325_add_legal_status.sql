-- Author: Copilot
-- Ticket: TBD

BEGIN TRANSACTION;

-- Add legal_status column to regulations and bulletins with allowed values
ALTER TABLE IF EXISTS public.regulations
  ADD COLUMN IF NOT EXISTS legal_status text DEFAULT 'SIN_ESTADO';

ALTER TABLE IF EXISTS public.bulletins
  ADD COLUMN IF NOT EXISTS legal_status text DEFAULT 'SIN_ESTADO';

-- Add constraint to restrict values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'regulations_legal_status_check'
  ) THEN
    ALTER TABLE public.regulations ADD CONSTRAINT regulations_legal_status_check CHECK (legal_status IN ('VIGENTE','PARCIAL','SIN_ESTADO'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bulletins_legal_status_check'
  ) THEN
    ALTER TABLE public.bulletins ADD CONSTRAINT bulletins_legal_status_check CHECK (legal_status IN ('VIGENTE','PARCIAL','SIN_ESTADO'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_regulations_legal_status ON public.regulations(legal_status);

COMMIT;
