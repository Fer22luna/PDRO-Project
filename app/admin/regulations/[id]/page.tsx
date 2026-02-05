'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Regulation } from '@/types';
import AdminRegulationEditor from '@/components/AdminRegulationEditor';
import { toast } from 'sonner';

export default function RegulationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    fecha: '',
    estado: '',
    keywords: '',
    contenido: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegulation = async () => {
      try {
        const response = await fetch(`/api/regulations/${id}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setRegulation(data.data);
        setEditData({
          fecha: data.data.publicationDate ? new Date(data.data.publicationDate).toISOString().split('T')[0] : '',
          estado: data.data.legalStatus || 'SIN_ESTADO',
          keywords: data.data.keywords?.join(', ') || '',
          contenido: data.data.content || '',
        });
      } catch (error) {
        console.error('Error fetching regulation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegulation();
  }, [id]);

  const handleCancelEdit = () => {
    if (confirm('¿Descartar los cambios realizados?')) {
      setIsEditMode(false);
      if (regulation) {
        setEditData({
          fecha: regulation.publicationDate ? new Date(regulation.publicationDate).toISOString().split('T')[0] : '',
          estado: regulation.legalStatus || 'SIN_ESTADO',
          keywords: regulation.keywords?.join(', ') || '',
          contenido: regulation.content || '',
        });
      }
    }
  };

  // Handler used by the full editor which supports workflow transitions
  const handleSaveFullEditor = async (updated: Partial<Regulation>) => {
    try {
      const response = await fetch(`/api/regulations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        const message = (json && (json.message || json.error)) || `Error ${response.status}`;
        throw new Error(message);
      }

      const json = await response.json();
      setRegulation(json.data);
      setIsEditMode(false);
      toast.success('Cambios guardados', {
        description: 'La normativa ha sido actualizada exitosamente.',
      });
    } catch (error) {
      console.error('Error saving regulation (full editor)', error);
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'No se pudieron guardar los cambios.',
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/regulations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationDate: editData.fecha,
          legalStatus: editData.estado,
          keywords: editData.keywords.split(',').map(k => k.trim()).filter(k => k),
          content: editData.contenido,
        }),
      });

      if (!response.ok) throw new Error('Error saving');

      const updated = await response.json();
      setRegulation(updated.data);
      setIsEditMode(false);
      alert('Cambios guardados exitosamente!');
    } catch (error) {
      alert('Error al guardar los cambios');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!regulation) {
    return (
      <div className="page-container">
        <p>Normativa no encontrada</p>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <AdminRegulationEditor
        regulation={regulation}
        onSave={handleSaveFullEditor}
        onCancel={handleCancelEdit}
      />
    );
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'DECREE':
        return 'Decreto';
      case 'RESOLUTION':
        return 'Resolución';
      case 'ORDINANCE':
        return 'Ordenanza';
      case 'TRIBUNAL_RESOLUTION':
        return 'Resolución Tribunal';
      case 'BID':
        return 'Licitación';
      default:
        return String(type);
    }
  };

  const typeLabel = getTypeLabel(regulation.type);

  const stateLabel = (() => {
    const s = String(regulation.legalStatus || '').toUpperCase();
    switch (s) {
      case 'VIGENTE':
        return 'Vigente';
      case 'PARCIAL':
        return 'Parcialmente vigente';
      case 'SIN_ESTADO':
      default:
        return 'Sin estado';
    }
  })();

  return (
    <>
      {/* Page Header */}
      <div className="page-header-detail">
        <div className="page-header-info-detail">
          <div className="page-header-label">Detalles de normativa</div>
          <h2 className="page-header-title-detail">{regulation.specialNumber}</h2>
          <p className="page-header-subtitle-detail">{regulation.reference}</p>
        </div>
        <div className="page-header-actions-detail">
          <Link href="/admin" className="btn btn-secondary">
            ← Volver a Administración
          </Link>
          <button
            className="btn btn-primary btn-edit-toggle"
            onClick={() => setIsEditMode(!isEditMode)}
            style={{ display: isEditMode ? 'none' : 'inline-flex' }}
          >
            ✏️ Editar
          </button>
          {regulation.fileUrl && (
            <a href={regulation.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              ⬇️ Descargar PDF
            </a>
          )}
          <button className="btn btn-danger">
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid-detail">
        {/* Main Content */}
        <div>
          {/* Metadata Section */}
          <div className="content-card-detail">
            <div className="card-section-detail">
              <div className="section-header-detail">
                <h3 className="section-title-detail">{typeLabel}</h3>
              </div>
              <h2 className="section-main-title-detail">{regulation.specialNumber}</h2>
              <p className="section-subtitle-detail">{regulation.reference}</p>

              <div className="metadata-grid-detail">
                <div className="metadata-item-detail">
                  <span className="metadata-label-detail">Fecha de Publicación</span>
                  {!isEditMode ? (
                    <span className="metadata-value-detail">
                      {regulation.publicationDate
                        ? new Date(regulation.publicationDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  ) : (
                    <input
                      type="date"
                      className="form-control-detail edit-mode-control"
                      value={editData.fecha}
                      onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
                    />
                  )}
                </div>
                <div className="metadata-item-detail">
                  <span className="metadata-label-detail">Estado Legal</span>
                          {!isEditMode ? (
                    <span className="metadata-value-detail">{stateLabel}</span>
                  ) : (
                    <select
                      className="form-control-detail edit-mode-control"
                      value={editData.estado}
                      onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
                    >
                      <option value="VIGENTE">Vigente</option>
                      <option value="SIN_ESTADO">Sin estado</option>
                      <option value="PARCIAL">Parcialmente vigente</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Keywords Section */}
            <div className="card-section-detail">
              <h3 className="section-title-detail">Palabras Clave</h3>
              {!isEditMode ? (
                <div className="keywords-detail">
                  {regulation.keywords && regulation.keywords.length > 0 ? (
                    regulation.keywords.map((keyword) => (
                      <span key={keyword} className="keyword-tag-detail">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Sin palabras clave</p>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  className="form-control-detail edit-mode-control"
                  value={editData.keywords}
                  onChange={(e) => setEditData({ ...editData, keywords: e.target.value })}
                  placeholder="Palabras clave separadas por comas"
                />
              )}
            </div>

            {/* PDF Section */}
            {regulation.fileUrl && (
              <div className="card-section-detail">
                <h3 className="section-title-detail">Documento Original</h3>
                {!isEditMode ? (
                  <a href={regulation.fileUrl} target="_blank" rel="noreferrer" className="pdf-link-detail">
                    📄 Ver PDF
                  </a>
                ) : (
                  <div
                    className="file-upload-edit-detail"
                    onClick={() => document.getElementById(`pdf-upload-${id}`)?.click()}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Reemplazar PDF</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      Haz clic para seleccionar o arrastra el archivo aquí
                    </div>
                  </div>
                )}
                <input type="file" id={`pdf-upload-${id}`} accept=".pdf" style={{ display: 'none' }} />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="content-card-detail" style={{ marginTop: '2rem' }}>
            <div className="card-section-detail">
              <h3 className="section-title-detail">Contenido</h3>
              {!isEditMode ? (
                <div className="content-display-detail">{regulation.content}</div>
              ) : (
                <textarea
                  className="form-control-detail edit-mode-control"
                  value={editData.contenido}
                  onChange={(e) => setEditData({ ...editData, contenido: e.target.value })}
                  placeholder="Contenido de la normativa..."
                  style={{ minHeight: '150px' }}
                />
              )}
            </div>

            {/* Edit Mode Actions */}
            {isEditMode && (
              <div className="card-section-detail edit-mode-actions-detail">
                <button className="btn btn-secondary" onClick={handleCancelEdit} style={{ flex: 1 }}>
                  ✕ Cancelar
                </button>
                <button className="btn btn-success" onClick={handleSaveChanges} style={{ flex: 2 }}>
                  ✓ Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Sidebar */}
        <aside>
          <div className="workflow-card-detail">
            <h3 className="workflow-title-detail">Workflow</h3>
            <p className="workflow-subtitle-detail">Gestiona el flujo de aprobación de la normativa</p>

            <div className="workflow-status-detail">
              <span>✓</span>
              <span>{typeLabel} - {regulation.state}</span>
            </div>

            <div className="workflow-actions-detail">
              <div className="workflow-actions-label-detail">Transiciones disponibles</div>
              <button className="workflow-button-detail">
                <span>📦</span>
                <span>Archivado</span>
              </button>
            </div>

            <div className="workflow-history-detail">
              <div className="workflow-history-label-detail">Historial</div>
              <div className="workflow-timeline-detail">
                <div className="timeline-item-detail">
                  <div className="timeline-icon-detail">✓</div>
                  <div className="timeline-content-detail">
                    <div className="timeline-title-detail">Creado</div>
                    <div className="timeline-meta-detail">
                      {regulation.createdAt
                        ? new Date(regulation.createdAt).toLocaleString('es-ES')
                        : 'Sin fecha'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
