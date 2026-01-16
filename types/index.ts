export type RegulationType = 'DECREE' | 'RESOLUTION' | 'ORDINANCE';

export type WorkflowState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface Regulation {
  id: string;
  type: RegulationType;
  specialNumber: string;
  publicationDate: Date;
  reference: string;
  content: string;
  keywords: string[];
  pdfUrl?: string;
  fileUrl?: string;
  state: WorkflowState;
  stateHistory: StateTransition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StateTransition {
  fromState: WorkflowState | null;
  toState: WorkflowState;
  timestamp: Date;
  userId: string;
  userRole: string;
  notes?: string;
}

export interface RegulationFilter {
  type?: RegulationType;
  dateFrom?: Date;
  dateTo?: Date;
  keywords?: string;
  searchText?: string;
  state?: WorkflowState;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'REVIEWER' | 'DIRECTOR' | 'VIEWER';
}
