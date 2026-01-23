'use client';

import { Regulation, RegulationType } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const getTypeBadgeVariant = (type: RegulationType) => {
    switch (type) {
      case 'DECREE':
        return 'default' as const;
      case 'RESOLUTION':
        return 'secondary' as const;
      case 'ORDINANCE':
        return 'outline' as const;
      case 'TRIBUNAL_RESOLUTION':
        return 'secondary' as const;
      case 'BID':
        return 'default' as const;
    }
  };

  const getStateBadgeVariant = (state: string) => {
    switch (state) {
      case 'PUBLISHED':
        return 'default' as const;
      case 'APPROVED':
        return 'secondary' as const;
      case 'REVIEW':
        return 'outline' as const;
      case 'DRAFT':
        return 'outline' as const;
      case 'ARCHIVED':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'DRAFT':
        return 'Borrador';
      case 'REVIEW':
        return 'En Revisión';
      case 'APPROVED':
        return 'Aprobado';
      case 'PUBLISHED':
        return 'Publicado';
      case 'ARCHIVED':
        return 'Archivado';
      default:
        return state;
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

  const getLegalStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'VIGENTE':
        return 'default' as const;
      case 'PARCIAL':
        return 'secondary' as const;
      case 'SIN_ESTADO':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  if (regulations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontraron regulaciones que coincidan con los criterios de búsqueda.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-lg bg-white/95">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-700">Fecha Publicación</TableHead>
              <TableHead className="text-gray-700">Número Especial</TableHead>
              <TableHead className="text-gray-700">Referencia</TableHead>
              <TableHead className="text-gray-700">Estado Legal</TableHead>
              <TableHead className="text-gray-700">Tipo</TableHead>
              {showState && <TableHead className="text-gray-700">Estado</TableHead>}
              <TableHead className="text-right text-gray-700">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regulations.map((regulation) => (
              <TableRow key={regulation.id}>
                <TableCell>
                  {format(regulation.publicationDate, 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="font-medium">
                  {regulation.specialNumber}
                </TableCell>
                <TableCell>{regulation.reference}</TableCell>
                <TableCell>
                  <Badge variant={getLegalStatusBadgeVariant(regulation.legalStatus ?? 'SIN_ESTADO')}>
                    {getLegalStatusLabel(regulation.legalStatus ?? 'SIN_ESTADO')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeBadgeVariant(regulation.type)}>
                    {getTypeLabel(regulation.type)}
                  </Badge>
                </TableCell>
                {showState && (
                  <TableCell>
                    <Badge variant={getStateBadgeVariant(regulation.state)}>
                      {getStateLabel(regulation.state)}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="text-right space-x-2">
                  <Link href={`/${showState ? 'admin/' : ''}regulations/${regulation.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  {showState && (
                    <Link href={`/admin/regulations/${regulation.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                  )}
                  {onDownloadPDF && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownloadPDF(regulation)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {regulations.map((regulation) => (
          <div
            key={regulation.id}
            className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50 to-white px-4 py-2 flex items-center justify-between">
              <Badge variant={getTypeBadgeVariant(regulation.type)}>
                {getTypeLabel(regulation.type)}
              </Badge>
              <p className="text-xs text-gray-600">{format(regulation.publicationDate, 'dd/MM/yyyy')}</p>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-lg">{regulation.specialNumber}</h3>
              <p className="text-sm text-gray-700">{regulation.reference}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getLegalStatusBadgeVariant(regulation.legalStatus ?? 'SIN_ESTADO')}>
                  {getLegalStatusLabel(regulation.legalStatus ?? 'SIN_ESTADO')}
                </Badge>
                {showState && (
                  <Badge variant={getStateBadgeVariant(regulation.state)}>
                    {getStateLabel(regulation.state)}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">Expediente / Ref: {regulation.reference}</div>

              <div className="flex space-x-2 pt-2">
                <Link href={`/${showState ? 'admin/' : ''}regulations/${regulation.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </Link>
                {showState && (
                  <Link href={`/admin/regulations/${regulation.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                )}
                {onDownloadPDF && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownloadPDF(regulation)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
