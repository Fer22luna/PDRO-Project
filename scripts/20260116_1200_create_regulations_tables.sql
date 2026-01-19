-- Author: Copilot
-- Ticket: TBD

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS public.regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('DECREE', 'RESOLUTION', 'ORDINANCE')),
  special_number text NOT NULL,
  publication_date date NOT NULL,
  reference text NOT NULL,
  content text NOT NULL,
  keywords text[] DEFAULT ARRAY[]::text[],
  state text NOT NULL CHECK (state IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
  legal_status text NOT NULL DEFAULT 'SIN_ESTADO' CHECK (legal_status IN ('VIGENTE','PARCIAL','SIN_ESTADO')),
  pdf_url text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.regulation_state_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id uuid NOT NULL REFERENCES public.regulations(id) ON DELETE CASCADE,
  from_state text CHECK (from_state IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
  to_state text NOT NULL CHECK (to_state IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_id text,
  user_role text,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_regulations_state ON public.regulations(state);
CREATE INDEX IF NOT EXISTS idx_regulations_publication_date ON public.regulations(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_state_transitions_regulation_id ON public.regulation_state_transitions(regulation_id);

COMMIT;
