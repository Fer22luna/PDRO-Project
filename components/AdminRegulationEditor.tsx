"use client";

import { useState, useMemo } from 'react';
import { Regulation, RegulationType, StateTransition, WorkflowState } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Props {
  regulation: Regulation;
  onSave: (r: Partial<Regulation>) => Promise<void> | void;
  onCancel: () => void;
}

const stateLabels: Record<WorkflowState, string> = {
  DRAFT: 'Borrador',
  REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

function getAvailableTransitions(state: WorkflowState): WorkflowState[] {
  switch (state) {
    case 'DRAFT':
      return ['REVIEW'];
    case 'REVIEW':
      return ['APPROVED', 'DRAFT'];
    case 'APPROVED':
      return ['PUBLISHED', 'REVIEW'];
    case 'PUBLISHED':
      return ['ARCHIVED'];
    default:
      return [];
  }
}

export default function AdminRegulationEditor({ regulation, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Partial<Regulation>>({
    ...regulation,
  });
  const [history, setHistory] = useState<StateTransition[]>(regulation.stateHistory ?? []);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const availableTransitions = useMemo(() => getAvailableTransitions((draft.state as WorkflowState) || regulation.state), [draft.state, regulation.state]);

  const handleFieldChange = (field: keyof Regulation, value: any) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (value: string) => {
    setDraft((prev) => ({ ...prev, publicationDate: new Date(value) }));
  };

  const handleStateTransition = (nextState: WorkflowState) => {
    const previousState = (draft.state as WorkflowState) || regulation.state;
    setHistory((prev) => [
      ...prev,
      {
        fromState: previousState,
        toState: nextState,
        timestamp: new Date(),
        userId: 'current-user',
        userRole: 'ADMIN',
      },
    ]);
    setDraft((prev) => ({ ...prev, state: nextState }));
  };

  const uploadFileIfNeeded = async (): Promise<string | undefined> => {
    if (!pdfFile) return draft.fileUrl ?? draft.pdfUrl ?? regulation.fileUrl ?? regulation.pdfUrl;

    const formData = new FormData();
    formData.append('file', pdfFile);

    const response = await fetch('/api/uploads/regulation-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('No se pudo subir el PDF');
    }

    const json = await response.json();
    return json.url as string;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadFileIfNeeded();
      await onSave({
        ...draft,
        fileUrl: uploadedUrl ?? draft.fileUrl ?? regulation.fileUrl,
        pdfUrl: uploadedUrl ?? draft.pdfUrl ?? regulation.pdfUrl,
      });
      toast.success('Normativa guardada exitosamente', {
        description: `${draft.specialNumber || regulation.specialNumber} ha sido actualizada.`,
      });
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'No se pudo guardar la normativa. Intenta de nuevo.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isoDate = draft.publicationDate ? format(draft.publicationDate as Date, 'yyyy-MM-dd') : (regulation.publicationDate ? format(regulation.publicationDate, 'yyyy-MM-dd') : '');

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <div className="page-header-label">Detalles de normativa</div>
          <h2 className="page-header-title">{draft.specialNumber || regulation.specialNumber}</h2>
          <p className="page-header-subtitle">{draft.title || regulation.title || 'Normativa'}</p>
        </div>
        <div className="page-header-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            ← Volver a Administración
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn btn-success">
            ✓ Guardar Cambios
          </button>
          <button onClick={() => { setDraft({ ...regulation }); setHistory(regulation.stateHistory ?? []); }} className="btn btn-secondary">
            ↻ Restablecer
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Main Content */}
        <div>
          {/* Metadata Section */}
          <div className="content-card">
            <div className="card-section">
              <div className="section-header">
                <h3 className="section-title">Decreto</h3>
              </div>
              <h2 className="section-main-title">{draft.specialNumber || regulation.specialNumber}</h2>
              <p className="section-subtitle">{draft.title || regulation.title}</p>

              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Tipo de Documento</span>
                  <select 
                    className="form-control"
                    value={(draft.type || regulation.type)} 
                    onChange={(e) => handleFieldChange('type', e.target.value as RegulationType)}
                  >
                    <option value="DECREE">Decreto</option>
                    <option value="RESOLUTION">Resolución</option>
                    <option value="ORDINANCE">Ordenanza</option>
                    <option value="TRIBUNAL_RESOLUTION">Resolución Tribunal</option>
                    <option value="BID">Licitación</option>
                  </select>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Número Especial</span>
                  <input 
                    type="text" 
                    className="form-control"
                    value={draft.specialNumber ?? regulation.specialNumber} 
                    onChange={(e) => handleFieldChange('specialNumber', e.target.value)} 
                    placeholder="Ej: NE-2026-005"
                  />
                </div>
              </div>
            </div>

            {/* Date and Status Section */}
            <div className="card-section">
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Fecha de Publicación</span>
                  <input 
                    type="date" 
                    className="form-control"
                    value={isoDate} 
                    onChange={(e) => handleDateChange(e.target.value)} 
                  />
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Estado Legal</span>
                  <select 
                    className="form-control"
                    value={draft.legalStatus || regulation.legalStatus || 'VIGENTE'}
                    onChange={(e) => handleFieldChange('legalStatus', e.target.value)}
                  >
                    <option value="VIGENTE">Vigente</option>
                    <option value="SIN_ESTADO">Sin estado</option>
                    <option value="PARCIAL">Derogado Parcialmente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reference Section */}
            <div className="card-section">
              <div className="metadata-item">
                <span className="metadata-label">Referencia / Expediente</span>
                <input 
                  type="text" 
                  className="form-control"
                  value={draft.reference ?? regulation.reference} 
                  onChange={(e) => handleFieldChange('reference', e.target.value)} 
                  placeholder="Ej: EXP-2026-00001"
                />
              </div>
            </div>

            {/* Keywords Section */}
            <div className="card-section">
              <h3 className="section-title">Palabras Clave</h3>
              <input 
                type="text" 
                className="form-control"
                defaultValue={draft.keywords?.join(', ') || regulation.keywords?.join(', ') || ''}
                onChange={(e) => handleFieldChange('keywords', e.target.value.split(',').map(k => k.trim()))}
                placeholder="Palabras clave separadas por comas"
              />
            </div>

            {/* PDF Section */}
            <div className="card-section">
              <h3 className="section-title">Documento Original</h3>
              {regulation.fileUrl || regulation.pdfUrl ? (
                <a href={regulation.fileUrl || regulation.pdfUrl} className="pdf-link" target="_blank" rel="noopener noreferrer">
                  📄 Ver PDF
                </a>
              ) : (
                <p className="metadata-label">No hay PDF asociado</p>
              )}
              <div className="file-upload-edit" onClick={() => document.getElementById('pdf-upload')?.click()}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📁</div>
                <div style={{fontWeight: '500', marginBottom: '0.25rem'}}>Reemplazar PDF</div>
                <div style={{fontSize: '0.8125rem', color: 'var(--gray-500)'}}>
                  Haz clic para seleccionar o arrastra el archivo aquí
                </div>
              </div>
              <input 
                type="file" 
                id="pdf-upload"
                accept=".pdf" 
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                style={{display: 'none'}}
              />
              {pdfFile && (
                <div style={{marginTop: '0.75rem', padding: '0.75rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '0.5rem', fontSize: '0.9375rem', color: 'var(--gray-700)'}}>
                  📄 {pdfFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="content-card" style={{marginTop: '2rem'}}>
            <div className="card-section">
              <h3 className="section-title">Contenido</h3>
              <textarea 
                className="form-control"
                value={draft.content || regulation.content || ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                placeholder="Contenido de la normativa..."
                style={{minHeight: '200px'}}
              />
            </div>

            {/* Edit Mode Actions */}
            <div className="card-section" style={{display: 'flex', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)', marginTop: '1.5rem'}}>
              <button onClick={onCancel} className="btn btn-secondary" style={{flex: 1}}>
                ✕ Cancelar
              </button>
              <button onClick={handleSave} disabled={isSaving} className="btn btn-success" style={{flex: 2}}>
                ✓ Guardar Cambios
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Sidebar */}
        <aside>
          <div className="workflow-card">
            <h3 className="workflow-title">Workflow</h3>
            <p className="workflow-subtitle">Gestiona el flujo de aprobación de la normativa</p>

            <div className="workflow-status">
              <span>✓</span>
              <span>{stateLabels[(draft.state as WorkflowState) || regulation.state]}</span>
            </div>

            <div className="workflow-actions">
              {availableTransitions.length > 0 ? (
                <>
                  <div className="workflow-actions-label">Transiciones disponibles</div>
                  {availableTransitions.map((state) => (
                    <button 
                      key={state}
                      className="workflow-button" 
                      onClick={() => handleStateTransition(state)}
                    >
                      <span>📦</span>
                      <span>{stateLabels[state]}</span>
                    </button>
                  ))}
                </>
              ) : (
                <p style={{fontSize: '0.875rem', color: 'var(--gray-500)'}}>Sin transiciones disponibles.</p>
              )}
            </div>

            <div className="workflow-history">
              <div className="workflow-history-label">Historial</div>
              <div className="workflow-timeline">
                {history.map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-icon">✓</div>
                    <div className="timeline-content">
                      <div className="timeline-title">
                        {item.fromState ? `${stateLabels[item.fromState]} → ${stateLabels[item.toState]}` : `Creado como ${stateLabels[item.toState]}`}
                      </div>
                      <div className="timeline-meta">{format(item.timestamp, 'dd/MM/yyyy HH:mm')} - {item.userRole}</div>
                      {item.notes && <div style={{fontSize: '0.875rem', color: 'var(--gray-500)'}}>{item.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
