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
    // Try to fetch published regulations from the API; fall back to mock data on error
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.set('state', 'PUBLISHED');
        if (filters.type) params.set('type', filters.type);
        if (filters.searchText) params.set('search', filters.searchText);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);

        const response = await fetch(`/api/regulations?${params.toString()}`);
        if (!response.ok) {
          throw new Error('API error');
        }

        const json = await response.json();
        const regs = json?.data ?? [];
        // normalize dates and shapes
        setRegulations(regs.map((r: any) => ({
          ...r,
          publicationDate: new Date(r.publicationDate ?? r.publication_date),
          createdAt: new Date(r.createdAt ?? r.created_at),
          updatedAt: new Date(r.updatedAt ?? r.updated_at),
          stateHistory: (r.stateHistory || r.regulation_state_transitions || []).map((t: any) => ({
            fromState: t.fromState ?? t.from_state ?? null,
            toState: t.toState ?? t.to_state,
            timestamp: new Date(t.timestamp),
            userId: t.userId ?? t.user_id ?? 'unknown',
            userRole: t.userRole ?? t.user_role ?? 'UNKNOWN',
            notes: t.notes ?? undefined,
          })),
        })));
      } catch (err) {
        // fallback: use local mock data
        const allRegulations = getRegulations({
          ...filters,
          state: 'PUBLISHED',
          dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        });
        setRegulations(allRegulations);
      }
    };

    fetchData();
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
