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
import { Eye, Download } from 'lucide-react';
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
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha Publicación</TableHead>
              <TableHead>Número Especial</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Tipo</TableHead>
              {showState && <TableHead>Estado</TableHead>}
              <TableHead className="text-right">Acciones</TableHead>
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
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <Badge variant={getTypeBadgeVariant(regulation.type)}>
                {getTypeLabel(regulation.type)}
              </Badge>
              {showState && (
                <Badge variant={getStateBadgeVariant(regulation.state)}>
                  {getStateLabel(regulation.state)}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {regulation.specialNumber}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{regulation.reference}</p>
            <p className="text-xs text-gray-500 mb-3">
              {format(regulation.publicationDate, 'dd/MM/yyyy')}
            </p>
            <div className="flex space-x-2">
              <Link href={`/${showState ? 'admin/' : ''}regulations/${regulation.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </Link>
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
        ))}
      </div>
    </>
  );
}
