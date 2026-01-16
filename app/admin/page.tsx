'use client';

import { useState, useEffect } from 'react';
import { Regulation, RegulationType, WorkflowState } from '@/types';
import { getRegulations } from '@/lib/mockData';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import FilterBar from '@/components/FilterBar';
import RegulationsTable from '@/components/RegulationsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckCircle, Clock, Archive } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [filters, setFilters] = useState<{
    type?: RegulationType;
    state?: WorkflowState;
    searchText?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  useEffect(() => {
    const allRegulations = getRegulations({
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    });
    setRegulations(allRegulations);
  }, [filters]);

  const handleDownloadPDF = (regulation: Regulation) => {
    downloadRegulationPDF(regulation);
  };

  // Calculate statistics
  const stats = {
    total: regulations.length,
    published: regulations.filter(r => r.state === 'PUBLISHED').length,
    inReview: regulations.filter(r => r.state === 'REVIEW').length,
    drafts: regulations.filter(r => r.state === 'DRAFT').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Gestiona decretos, resoluciones y ordenanzas
            </p>
          </div>
          <Link href="/admin/regulations/new">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Normativa
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Normativas totales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles públicamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de aprobación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              En edición
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Búsqueda y Filtros</CardTitle>
          <CardDescription>
            Filtra las normativas por tipo, estado, fecha o palabras clave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilterBar onFilterChange={setFilters} showStateFilter={true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Normativas</CardTitle>
          <CardDescription>
            {regulations.length} normativa(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegulationsTable
            regulations={regulations}
            showState={true}
            onDownloadPDF={handleDownloadPDF}
          />
        </CardContent>
      </Card>
    </div>
  );
}
