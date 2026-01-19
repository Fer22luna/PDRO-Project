import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { Regulation, RegulationType, StateTransition, WorkflowState } from '@/types';

interface RegulationRow {
  id: string;
  type: RegulationType;
  special_number: string;
  publication_date: string;
  reference: string;
  content: string;
  keywords: string[] | null;
  state: WorkflowState;
  legal_status?: string | null;
  pdf_url: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
  regulation_state_transitions?: StateTransitionRow[];
}

interface StateTransitionRow {
  id: string;
  from_state: WorkflowState | null;
  to_state: WorkflowState;
  timestamp: string;
  user_id: string | null;
  user_role: string | null;
  notes: string | null;
}

const ALLOWED_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  DRAFT: ['REVIEW'],
  REVIEW: ['APPROVED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'REVIEW'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
};

function mapTransition(row: StateTransitionRow): StateTransition {
  return {
    fromState: row.from_state,
    toState: row.to_state,
    timestamp: new Date(row.timestamp),
    userId: row.user_id || 'unknown',
    userRole: row.user_role || 'UNKNOWN',
    notes: row.notes || undefined,
  };
}

function mapRegulation(row: RegulationRow): Regulation {
  const history = row.regulation_state_transitions?.map(mapTransition) ?? [];
  return {
    id: row.id,
    type: row.type,
    specialNumber: row.special_number,
    publicationDate: new Date(row.publication_date),
    reference: row.reference,
    content: row.content,
    keywords: row.keywords ?? [],
    state: row.state,
    legalStatus: (row.legal_status as any) ?? 'SIN_ESTADO',
    stateHistory: history,
    pdfUrl: row.pdf_url ?? undefined,
    fileUrl: row.file_url ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function fetchRegulationsFromDb(filter?: {
  type?: RegulationType;
  state?: WorkflowState;
  searchText?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<Regulation[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('regulations')
    .select(
      'id,type,special_number,publication_date,reference,content,keywords,state,legal_status,pdf_url,file_url,created_at,updated_at,regulation_state_transitions(*)'
    );

  if (filter?.type) {
    query = query.eq('type', filter.type);
  }

  if (filter?.state) {
    query = query.eq('state', filter.state);
  }

  if (filter?.searchText) {
    const like = `%${filter.searchText}%`;
    query = query.or(`reference.ilike.${like},content.ilike.${like}`);
  }

  if (filter?.dateFrom) {
    query = query.gte('publication_date', filter.dateFrom.toISOString());
  }

  if (filter?.dateTo) {
    query = query.lte('publication_date', filter.dateTo.toISOString());
  }

  query = query.order('publication_date', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Supabase query error in fetchRegulationsFromDb', error);
    // Throw serialized error for easier debugging in the API layer
    throw new Error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }

  try {
    return (data || []).map(mapRegulation);
  } catch (mapError) {
    console.error('Error mapping regulations data', { mapError, dataSample: (data || []).slice(0, 5) });
    throw mapError instanceof Error ? mapError : new Error('Error mapping regulations');
  }
}

export async function fetchRegulationByIdFromDb(id: string): Promise<Regulation | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('regulations')
    .select(
      'id,type,special_number,publication_date,reference,content,keywords,state,legal_status,pdf_url,file_url,created_at,updated_at,regulation_state_transitions(*)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRegulation(data as RegulationRow) : null;
}

export async function createRegulationInDb(payload: Partial<Regulation>): Promise<Regulation> {
  const supabase = getSupabaseServerClient();
  const insertData = {
    type: payload.type,
    special_number: payload.specialNumber,
    publication_date: payload.publicationDate,
    reference: payload.reference,
    content: payload.content,
    keywords: payload.keywords ?? [],
    state: payload.state ?? 'DRAFT',
    legal_status: payload.legalStatus ?? 'SIN_ESTADO',
    pdf_url: payload.pdfUrl ?? null,
    file_url: payload.fileUrl ?? null,
  };

  const { data, error } = await supabase
    .from('regulations')
    .insert(insertData)
    .select(
      'id,type,special_number,publication_date,reference,content,keywords,state,legal_status,pdf_url,file_url,created_at,updated_at,regulation_state_transitions(*)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRegulation(data as RegulationRow);
}

export async function updateRegulationInDb(
  id: string,
  payload: Partial<Regulation>
): Promise<Regulation> {
  const supabase = getSupabaseServerClient();
  const updateData = {
    type: payload.type,
    special_number: payload.specialNumber,
    publication_date: payload.publicationDate,
    reference: payload.reference,
    content: payload.content,
    keywords: payload.keywords ?? [],
    state: payload.state,
    legal_status: payload.legalStatus,
    pdf_url: payload.pdfUrl ?? null,
    file_url: payload.fileUrl ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('regulations')
    .update(updateData)
    .eq('id', id)
    .select(
      'id,type,special_number,publication_date,reference,content,keywords,state,legal_status,pdf_url,file_url,created_at,updated_at,regulation_state_transitions(*)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRegulation(data as RegulationRow);
}

export function allowedTransitions(state: WorkflowState): WorkflowState[] {
  return ALLOWED_TRANSITIONS[state] || [];
}

export async function addTransitionInDb(
  regulation: Regulation,
  toState: WorkflowState,
  notes?: string
): Promise<Regulation> {
  const supabase = getSupabaseServerClient();
  const allowed = allowedTransitions(regulation.state);
  if (!allowed.includes(toState)) {
    throw new Error(`Invalid transition from ${regulation.state} to ${toState}`);
  }

  const { error: transitionError } = await supabase.from('regulation_state_transitions').insert({
    regulation_id: regulation.id,
    from_state: regulation.state,
    to_state: toState,
    user_id: 'current-user',
    user_role: 'ADMIN',
    notes: notes ?? null,
  });

  if (transitionError) {
    throw new Error(transitionError.message);
  }

  const { data: updatedRegulation, error } = await supabase
    .from('regulations')
    .update({ state: toState, updated_at: new Date().toISOString() })
    .eq('id', regulation.id)
    .select(
      'id,type,special_number,publication_date,reference,content,keywords,state,pdf_url,file_url,created_at,updated_at,regulation_state_transitions(*)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRegulation(updatedRegulation as RegulationRow);
}
