'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BulletinDocument,
  RegulationType,
  StateTransition,
  WorkflowState,
} from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  Save,
  ArrowRight,
  Upload,
} from 'lucide-react';

const initialDraft: BulletinDocument = {
  id: 'draft-lic-32-2025',
  // previous municipality/department/location removed per request
  issueDate: new Date('2026-01-12'),
  regulationType: 'RESOLUTION',
  documentNumber: 'IF-2026-00008553-PER-DIRC#SHF',
  reference: 'LICITACION PUBLICA N°32/2025 - EXP D 930/2025',
  title: 'LLAMADO A LICITACIÓN PÚBLICA N° 32 / 2025',
  subject: 'Llamado a licitación pública',
  openingDetails: 'Apertura prevista para 20/02/2026 a las 10:00 hs en mesa de entradas.',
  infoDetails: 'Contratación de servicios conforme pliego oficial. Presentar sobres cerrados.',
  signerName: 'Secretaría de Hacienda y Finanzas',
  signerRole: 'Autoridad emisora',
  state: 'DRAFT',
  stateHistory: [
    {
      fromState: null,
      toState: 'DRAFT',
      timestamp: new Date('2026-01-10T09:00:00'),
      userId: 'demo-admin',
      userRole: 'ADMIN',
      notes: 'Creado en el editor de boletín',
    },
  ],
};

const stateLabels: Record<WorkflowState, string> = {
  DRAFT: 'Borrador',
  REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

function getAvailableTransitions(state: WorkflowState): WorkflowState[] {
  switch (state) {
    case 'DRAFT':
      return ['REVIEW'];
    case 'REVIEW':
      return ['APPROVED', 'DRAFT'];
    case 'APPROVED':
      return ['PUBLISHED', 'REVIEW'];
    case 'PUBLISHED':
      return ['ARCHIVED'];
    default:
      return [];
  }
}

export default function BulletinEditorPage() {
  const [draft, setDraft] = useState<BulletinDocument>(initialDraft);
  const [history, setHistory] = useState<StateTransition[]>(
    initialDraft.stateHistory ?? []
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const availableTransitions = useMemo(
    () => getAvailableTransitions(draft.state),
    [draft.state]
  );

  const handleFieldChange = (
    field: keyof BulletinDocument,
    value: string | RegulationType | WorkflowState
  ) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (value: string) => {
    setDraft((prev) => ({ ...prev, issueDate: new Date(value) }));
  };

  const handleStateTransition = (nextState: WorkflowState) => {
    setDraft((prev) => {
      const previousState = prev.state;
      setHistory((prevHistory) => [
        ...prevHistory,
        {
          fromState: previousState,
          toState: nextState,
          timestamp: new Date(),
          userId: 'demo-admin',
          userRole: 'ADMIN',
          notes: 'Transición manual en el editor',
        },
      ]);
      return { ...prev, state: nextState };
    });
  };

  const handleSaveMock = () => {
    if (!pdfFile) {
      alert('Sube un PDF firmado antes de guardar.');
      return;
    }
    alert(`Se guardó el borrador con PDF: ${pdfFile.name} (mock). Integra API/DB/Storage para persistir.`);
  };

  const handleResetTemplate = () => {
    setDraft(initialDraft);
    setHistory(initialDraft.stateHistory ?? []);
  };

  const isoDate =
    draft.issueDate && !Number.isNaN(draft.issueDate.getTime())
      ? format(draft.issueDate, 'yyyy-MM-dd')
      : '';
  const readableDate =
    draft.issueDate && !Number.isNaN(draft.issueDate.getTime())
      ? format(draft.issueDate, 'dd/MM/yyyy')
      : 'Fecha pendiente';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Editor de Boletín Oficial</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Generar decreto o resolución
          </h1>
          <p className="text-gray-600 mt-1">
            Completa los campos, avanza el workflow y descarga el PDF con membrete y firma.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a administración
            </Button>
          </Link>
          <Button variant="secondary" onClick={handleResetTemplate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restablecer plantilla
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadatos</CardTitle>
              <CardDescription>
                Datos que alimentan el encabezado oficial y el workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tipo de documento
                  </label>
                  <Select
                    value={draft.regulationType}
                    onChange={(e) => handleFieldChange('regulationType', e.target.value as RegulationType)}
                  >
                    <option value="DECREE">Decreto</option>
                    <option value="RESOLUTION">Resolución</option>
                    <option value="ORDINANCE">Ordenanza</option>
                    <option value="TRIBUNAL_RESOLUTION">Resolución Tribunal</option>
                    <option value="BID">Licitación</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <Select
                    value={draft.state}
                    onChange={(e) => {
                      const next = e.target.value as WorkflowState;
                      if (next !== draft.state) {
                        handleStateTransition(next);
                      }
                    }}
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="REVIEW">En revisión</option>
                    <option value="APPROVED">Aprobado</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="ARCHIVED">Archivado</option>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Número oficial</label>
                  <Input
                    value={draft.documentNumber}
                    onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
                    placeholder="IF-2026-0000..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Referencia / Expediente</label>
                  <Input
                    value={draft.reference}
                    onChange={(e) => handleFieldChange('reference', e.target.value)}
                    placeholder="EXP D 930/2025"
                  />
                </div>
              </div>

              {/* Municipio, Localidad y Área responsable eliminados según solicitud */}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de emisión</label>
                  <Input
                    type="date"
                    value={isoDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Título principal</label>
                <Input
                  value={draft.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle>PDF firmado</CardTitle>
              <CardDescription>Sube el PDF ya firmado para asociarlo al decreto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Archivo PDF</label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se espera un PDF completo y firmado digitalmente. Este editor solo asocia el archivo.
                </p>
              </div>
              {pdfFile && (
                <div className="text-sm text-gray-700">
                  Archivo seleccionado: <span className="font-medium">{pdfFile.name}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSaveMock}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar con PDF (mock)
                </Button>
                <Button variant="outline" onClick={() => setPdfFile(null)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Limpiar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>Gestiona el ciclo de vida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="text-sm py-1 px-3">{stateLabels[draft.state]}</Badge>
                <span className="text-xs text-gray-500">{draft.regulationType}</span>
              </div>
              {availableTransitions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Mover a:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTransitions.map((state) => (
                      <Button
                        key={state}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStateTransition(state)}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        {stateLabels[state]}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin transiciones disponibles.</p>
              )}

              <div className="pt-2 space-y-3">
                <p className="text-sm font-medium text-gray-700">Historial</p>
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {item.fromState ? `${stateLabels[item.fromState]} → ${stateLabels[item.toState]}` : `Creado como ${stateLabels[item.toState]}`}
                        </p>
                        <p className="text-gray-500">
                          {format(item.timestamp, 'dd/MM/yyyy HH:mm')} · {item.userRole}
                        </p>
                        {item.notes && (
                          <p className="text-gray-500 text-xs">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
