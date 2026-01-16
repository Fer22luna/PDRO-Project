'use client';

import { useState, useEffect } from 'react';
import { Regulation, RegulationType, WorkflowState } from '@/types';
import { getRegulations } from '@/lib/mockData';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import FilterBar from '@/components/FilterBar';
import RegulationsTable from '@/components/RegulationsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [filters, setFilters] = useState<{
    type?: RegulationType;
    state?: WorkflowState;
    searchText?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  useEffect(() => {
    // Only show published regulations in public portal
    const allRegulations = getRegulations({
      ...filters,
      state: 'PUBLISHED',
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    });
    setRegulations(allRegulations);
  }, [filters]);

  const handleDownloadPDF = (regulation: Regulation) => {
    downloadRegulationPDF(regulation);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Portal Público
        </h1>
        <p className="text-gray-600">
          Consulta y descarga decretos, resoluciones y ordenanzas publicadas
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Búsqueda de Normativas</CardTitle>
          <CardDescription>
            Utiliza los filtros para encontrar la normativa que necesitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilterBar onFilterChange={setFilters} showStateFilter={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            {regulations.length} normativa(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegulationsTable
            regulations={regulations}
            showState={false}
            onDownloadPDF={handleDownloadPDF}
          />
        </CardContent>
      </Card>
    </div>
  );
}
