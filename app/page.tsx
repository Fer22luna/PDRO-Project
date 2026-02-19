"use client";

import { useState, useEffect, useMemo } from 'react';
import { Regulation, RegulationType } from '@/types';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import RegulationsTable from '@/components/RegulationsTable';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { normalizeRegulations } from '@/lib/utils';

type PublicFilters = {
  type?: RegulationType;
  searchText?: string;
  year?: string;
  month?: string;
  expediente?: string;
};

export default function Home() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [filters, setFilters] = useState<PublicFilters>({});
  const [formFilters, setFormFilters] = useState<PublicFilters>({});

  const { dateFrom, dateTo } = useMemo(() => {
    if (!filters.year && !filters.month) return { dateFrom: undefined as string | undefined, dateTo: undefined as string | undefined };

    // If month is selected but year is missing, assume current year to avoid Invalid Date errors
    const year = filters.year ? Number(filters.year) : new Date().getFullYear();
    if (Number.isNaN(year)) return { dateFrom: undefined as string | undefined, dateTo: undefined as string | undefined };

    const month = filters.month ? Number(filters.month) - 1 : 0;
    const from = new Date(year, month, 1);
    const to = filters.month ? new Date(year, month + 1, 0) : new Date(year, 11, 31);

    // Ensure dates are valid before calling toISOString
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return { dateFrom: undefined as string | undefined, dateTo: undefined as string | undefined };

    return { dateFrom: from.toISOString().split('T')[0], dateTo: to.toISOString().split('T')[0] };
  }, [filters.year, filters.month]);

  useEffect(() => {
    // Try to fetch published regulations from the API; fall back to mock data on error
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.set('state', 'PUBLISHED');
        if (filters.type) params.set('type', filters.type);
        const combinedSearch = [filters.searchText, filters.expediente].filter(Boolean).join(' ').trim();
        if (combinedSearch) params.set('search', combinedSearch);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);

        const response = await fetch(`/api/regulations?${params.toString()}`);
        if (!response.ok) {
          throw new Error('API error');
        }

        const json = await response.json();
        const regs = json?.data ?? [];
        const normalized: Regulation[] = normalizeRegulations(regs);

        const filtered = normalized.filter((reg) => {
          const matchesYear = filters.year ? reg.publicationDate.getFullYear() === Number(filters.year) : true;
          const matchesMonth = filters.month ? reg.publicationDate.getMonth() + 1 === Number(filters.month) : true;
          const expedienteTerm = filters.expediente?.toLowerCase().trim();
          const matchesExpediente = expedienteTerm
            ? (reg.reference?.toLowerCase().includes(expedienteTerm) || reg.specialNumber?.toLowerCase().includes(expedienteTerm))
            : true;
          const freeText = filters.searchText?.toLowerCase().trim();
          const matchesSearch = freeText
            ? [reg.reference, reg.content, reg.specialNumber, ...(reg.keywords ?? [])]
                .filter(Boolean)
                .some((field: any) => String(field).toLowerCase().includes(freeText))
            : true;
          return matchesYear && matchesMonth && matchesExpediente && matchesSearch;
        });

        setRegulations(filtered);
      } catch (err) {
        // API error — no fallback mock data in production; show empty list and log the error
        console.error('Failed to load regulations from API:', err);
        setRegulations([]);
      }
    };

    fetchData();
  }, [filters]);

  const handleDownloadPDF = (regulation: Regulation) => {
    downloadRegulationPDF(regulation);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, idx) => String(currentYear - idx));
  const monthOptions = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const applyFilters = () => setFilters(formFilters);
  const clearFilters = () => {
    setFormFilters({});
    setFilters({});
  };

  return (
    <div className="page-container">
      <div className="mb-8 flex flex-col gap-2 page-header">
         <h1 className="text-3xl md:text-4xl font-bold">
           Digesto Público
        </h1>
        <p>
          Busca por año, mes, tipo de documento y número de expediente. Descarga o visualiza en línea.
        </p>
      </div>

      <div className="search-section">
        <div className="search-header">
          <h3>Búsqueda Avanzada</h3>
        </div>

        <div className="search-grid">
          <div className="form-group">
            <label htmlFor="search-text">Buscar</label>
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="search-text"
                placeholder="Referencia, palabras clave..."
                value={formFilters.searchText ?? ''}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, searchText: e.target.value }))}
                className="pl-10 form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="doc-type">Tipo de Documento</label>
            <select
              id="doc-type"
              value={formFilters.type ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, type: e.target.value as RegulationType }))}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="DECREE">Decreto</option>
              <option value="RESOLUTION">Resolución</option>
              <option value="ORDINANCE">Ordenanza</option>
              <option value="TRIBUNAL_RESOLUTION">Resolución Tribunal</option>
              <option value="BID">Licitación</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Año</label>
            <select
              id="year"
              value={formFilters.year ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, year: e.target.value }))}
              className="form-control"
            >
              <option value="">Todos</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="month">Mes</label>
            <select
              id="month"
              value={formFilters.month ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, month: e.target.value }))}
              className="form-control"
            >
              <option value="">Todos</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expediente">Número de Expediente</label>
            <Input
              id="expediente"
              placeholder="Ej: EXP D 930/2025"
              value={formFilters.expediente ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, expediente: e.target.value }))}
              className="form-control"
            />
          </div>
        </div>

        <div className="search-actions">
          <button className="btn btn-secondary" onClick={clearFilters}>
            🔄 Limpiar
          </button>
          <button className="btn btn-primary" onClick={applyFilters}>
            🔍 Buscar
          </button>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <div className="results-count">
            Mostrando <strong>{regulations.length}</strong> de <strong>{regulations.length}</strong> documentos
          </div>
        </div>
        <RegulationsTable
          regulations={regulations}
          showState={false}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    </div>
  );
}
