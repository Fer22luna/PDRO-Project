'use client';

import { Regulation, RegulationType } from '@/types';
import { Eye, Download, Edit } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface RegulationsTableProps {
  regulations: Regulation[];
  showState?: boolean;
  onDownloadPDF?: (regulation: Regulation) => void;
}

export default function RegulationsTable({
  regulations,
  showState = false,
  onDownloadPDF,
}: RegulationsTableProps) {
  const getTypeLabel = (type: RegulationType) => {
    switch (type) {
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
    }
  };

  const getTypeBadgeClass = (type: RegulationType) => {
    switch (type) {
      case 'DECREE':
        return 'badge-decreto';
      case 'RESOLUTION':
        return 'badge-resolucion';
      case 'ORDINANCE':
        return 'badge-resolucion';
      case 'TRIBUNAL_RESOLUTION':
        return 'badge-resolucion';
      case 'BID':
        return 'badge-licitacion';
      default:
        return 'badge-decreto';
    }
  };

  const getLegalStatusLabel = (status: string) => {
    switch (status) {
      case 'VIGENTE':
        return 'Vigente';
      case 'PARCIAL':
        return 'Parcialmente vigente';
      case 'SIN_ESTADO':
        return 'Sin estado';
      default:
        return status;
    }
  };

  if (regulations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontraron regulaciones que coincidan con los criterios de búsqueda.
      </div>
    );
  }

  const getPdfUrl = (regulation: Regulation) => regulation.fileUrl || regulation.pdfUrl;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Número Especial</th>
            <th>Referencia</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {regulations.map((regulation) => (
            <tr key={regulation.id}>
              <td>{format(regulation.publicationDate, 'dd/MM/yyyy')}</td>
              <td>
                <span className="doc-number">{regulation.specialNumber}</span>
              </td>
              <td>
                <span className="doc-reference">{regulation.reference}</span>
              </td>
              <td>
                <span className={`badge ${getTypeBadgeClass(regulation.type)}`}>
                  {getTypeLabel(regulation.type)}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  {getPdfUrl(regulation) ? (
                    <a
                      href={getPdfUrl(regulation) as string}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-action btn-action-primary"
                    >
                      👁️ Ver PDF
                    </a>
                  ) : (
                    <Link
                      href={`/${showState ? 'admin/' : ''}regulations/${regulation.id}`}
                      className="btn-action btn-action-primary"
                    >
                      👁️ Ver
                    </Link>
                  )}
                  {onDownloadPDF && (
                    <button
                      onClick={() => onDownloadPDF(regulation)}
                      className="btn-action"
                    >
                      ⬇️ Descargar
                    </button>
                  )}
                  {showState && (
                    <Link
                      href={`/admin/regulations/${regulation.id}`}
                      className="btn-action btn-action-edit"
                    >
                      ✏️ Editar
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
