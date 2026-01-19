-- Author: Copilot
-- Ticket: TBD

BEGIN TRANSACTION;

-- Ensure the column exists (safe to run multiple times)
ALTER TABLE IF EXISTS public.regulations
  ADD COLUMN IF NOT EXISTS legal_status text DEFAULT 'SIN_ESTADO';

ALTER TABLE IF EXISTS public.bulletins
  ADD COLUMN IF NOT EXISTS legal_status text DEFAULT 'SIN_ESTADO';

-- Add constraints only when the table exists
DO $$
BEGIN
  IF to_regclass('public.regulations') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'regulations_legal_status_check'
    ) THEN
      ALTER TABLE public.regulations ADD CONSTRAINT regulations_legal_status_check CHECK (legal_status IN ('VIGENTE','PARCIAL','SIN_ESTADO'));
    END IF;
  END IF;

  IF to_regclass('public.bulletins') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'bulletins_legal_status_check'
    ) THEN
      ALTER TABLE public.bulletins ADD CONSTRAINT bulletins_legal_status_check CHECK (legal_status IN ('VIGENTE','PARCIAL','SIN_ESTADO'));
    END IF;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_regulations_legal_status ON public.regulations(legal_status);

COMMIT;
