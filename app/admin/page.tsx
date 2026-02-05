'use client';

import { useState, useEffect } from 'react';
import { Regulation, RegulationType, WorkflowState } from '@/types';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import FilterBar from '@/components/FilterBar';
import RegulationsTable from '@/components/RegulationsTable';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { normalizeRegulations } from '@/lib/utils';

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
    const fetchData = async () => {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.state) params.set('state', filters.state);
      if (filters.searchText) params.set('search', filters.searchText);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const response = await fetch(`/api/regulations?${params.toString()}`);
      if (!response.ok) {
        setRegulations([]);
        return;
      }

      const json = await response.json();
      setRegulations(normalizeRegulations(json.data));
    };

    fetchData();
  }, [filters]);

  const handleDownloadPDF = (regulation: Regulation) => {
    const storedUrl = regulation.fileUrl || regulation.pdfUrl;
    if (storedUrl) {
      window.open(storedUrl, '_blank', 'noopener');
      return;
    }
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
    <div className="page-container">
      <div className="page-header">
        <h2>Panel de Administración</h2>
        <p>Gestiona decretos, resoluciones y ordenanzas</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-title">Total</div>
            </div>
            <div className="stat-icon">📊</div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-description">Normativas totales</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div>
              <div className="stat-title">Publicadas</div>
            </div>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-value">{stats.published}</div>
          <div className="stat-description">Disponibles públicamente</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div>
              <div className="stat-title">En Revisión</div>
            </div>
            <div className="stat-icon">⏱️</div>
          </div>
          <div className="stat-value">{stats.inReview}</div>
          <div className="stat-description">Pendientes de aprobación</div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <div>
              <div className="stat-title">Borradores</div>
            </div>
            <div className="stat-icon">📝</div>
          </div>
          <div className="stat-value">{stats.drafts}</div>
          <div className="stat-description">En edición</div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-header">
          <h3>Búsqueda y Filtros</h3>
        </div>
        <div className="search-controls">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar por referencia, contenido o palabras clave..."
            />
          </div>
          <Link href="/admin/regulations/new">
            <button className="btn btn-primary">
              ➕ Nueva Normativa
            </button>
          </Link>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        <div className="results-header">
          <h3 className="results-title">Todas las Normativas</h3>
          <div className="results-count">
            <strong>{regulations.length}</strong> normativa(s) encontrada(s)
          </div>
        </div>
        <RegulationsTable
          regulations={regulations}
          showState={true}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    </div>
  );
}
