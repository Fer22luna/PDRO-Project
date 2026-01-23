"use client";

import { useState, useEffect, useMemo } from 'react';
import { Regulation, RegulationType } from '@/types';
import { getRegulations } from '@/lib/mockData';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import RegulationsTable from '@/components/RegulationsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
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
    const year = Number(filters.year);
    const month = filters.month ? Number(filters.month) - 1 : 0;
    const from = new Date(year, month, 1);
    const to = filters.month ? new Date(year, month + 1, 0) : new Date(year, 11, 31);
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
        // fallback: use local mock data
        const allRegulations = getRegulations({
          ...filters,
          state: 'PUBLISHED',
          searchText: [filters.searchText, filters.expediente].filter(Boolean).join(' ').trim() || undefined,
          dateFrom: dateFrom ? new Date(dateFrom) : undefined,
          dateTo: dateTo ? new Date(dateTo) : undefined,
        });
        setRegulations(allRegulations);
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
    <div className="container mx-auto px-4 py-8 mt-6">
      <div className="mb-8 flex flex-col gap-2">
         <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
           Digesto Público
        </h1>
        <p className="text-gray-600">
          Busca por año, mes, tipo de documento y número de expediente. Descarga o visualiza en línea.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 mb-8">
        <div className="lg:col-span-3">
          <Card className="h-full shadow-xl border border-gray-100 bg-white/95 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                 <div>
                  <CardTitle className="mb-2">Búsqueda</CardTitle>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Filtro</label>
                <div className="relative">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Referencia, palabras clave o contenido"
                    value={formFilters.searchText ?? ''}
                    onChange={(e) => setFormFilters((prev) => ({ ...prev, searchText: e.target.value }))}
                    className="pl-10 border-gray-300"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo de documento</label>
                <Select
                  value={formFilters.type ?? ''}
                  onChange={(e) => setFormFilters((prev) => ({ ...prev, type: e.target.value as RegulationType }))}
                className="border-gray-300">
                  <option value="">Todos</option>
                  <option value="DECREE">Decreto</option>
                  <option value="RESOLUTION">Resolución</option>
                  <option value="ORDINANCE">Ordenanza</option>
                  <option value="TRIBUNAL_RESOLUTION">Resolución Tribunal</option>
                  <option value="BID">Licitación</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Año</label>
                  <Select
                    value={formFilters.year ?? ''}
                    onChange={(e) => setFormFilters((prev) => ({ ...prev, year: e.target.value }))}
                   className="border-gray-300">
                    <option value="">Todos</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mes</label>
                  <Select
                    value={formFilters.month ?? ''}
                    onChange={(e) => setFormFilters((prev) => ({ ...prev, month: e.target.value }))}
                  className="border-gray-300"
                  >
                    <option value="">Todos</option>
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Número de expediente</label>
                <Input
                  placeholder="Ej: EXP D 930/2025"
                  value={formFilters.expediente ?? ''}
                  onChange={(e) => setFormFilters((prev) => ({ ...prev, expediente: e.target.value }))}
                    className="border-gray-300" 
                />
              </div>

              <div className="flex items-center justify-center  gap-2 pt-2">
                <Button className="" onClick={applyFilters}                  
                style={{background: "linear-gradient(135deg, #0000FF 0%, #6366F1 100%)", color: "#FFFFFF", border: "none" }}>Aplicar filtros</Button>
<Button 
  variant="outline" 
  onClick={clearFilters} 
  style={{
    background: "rgba(255, 255, 255, 0.1)",  // Fondo blanco semi-transparente
    color: "#6366F1",
    border: "2px solid #6366F1",
    backdropFilter: "blur(10px)"
  }}
>
  Limpiar
</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Card className="h-full shadow-xl border border-gray-100 bg-white/95 backdrop-blur-sm rounded-2xl">
            {/* <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription className="text-gray-600">{regulations.length} normativa(s) encontrada(s)</CardDescription>
            </CardHeader> */}
            <CardContent className="text-gray-700 mt-7">
              <RegulationsTable
                regulations={regulations}
                showState={false}
                onDownloadPDF={handleDownloadPDF}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
