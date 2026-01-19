import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Regulation, StateTransition } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDate(value: string | Date | null | undefined): Date {
  if (!value) return new Date(NaN);
  return value instanceof Date ? value : new Date(value);
}

export function normalizeRegulation(raw: any): Regulation {
  const history: StateTransition[] = (raw.stateHistory || raw.regulation_state_transitions || []).map((item: any) => ({
    fromState: item.fromState ?? item.from_state ?? null,
    toState: item.toState ?? item.to_state,
    timestamp: parseDate(item.timestamp),
    userId: item.userId ?? item.user_id ?? 'unknown',
    userRole: item.userRole ?? item.user_role ?? 'UNKNOWN',
    notes: item.notes ?? undefined,
  }));

  return {
    id: raw.id,
    type: raw.type,
    specialNumber: raw.specialNumber ?? raw.special_number,
    publicationDate: parseDate(raw.publicationDate ?? raw.publication_date),
    reference: raw.reference,
    content: raw.content,
    keywords: raw.keywords ?? [],
    state: raw.state,
    legalStatus: raw.legalStatus ?? raw.legal_status ?? 'SIN_ESTADO',
    stateHistory: history,
    pdfUrl: raw.pdfUrl ?? raw.pdf_url ?? undefined,
    fileUrl: raw.fileUrl ?? raw.file_url ?? undefined,
    createdAt: parseDate(raw.createdAt ?? raw.created_at),
    updatedAt: parseDate(raw.updatedAt ?? raw.updated_at),
  };
}

export function normalizeRegulations(rawList: any[] = []): Regulation[] {
  return rawList.map(normalizeRegulation);
}
