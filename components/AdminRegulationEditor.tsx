"use client";

import { useState, useMemo } from 'react';
import { Regulation, RegulationType, StateTransition, WorkflowState } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { format } from 'date-fns';
import { ArrowLeft, Clock, RefreshCw, Save, ArrowRight, Upload } from 'lucide-react';

interface Props {
  regulation: Regulation;
  onSave: (r: Partial<Regulation>) => Promise<void> | void;
  onCancel: () => void;
}

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

export default function AdminRegulationEditor({ regulation, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Partial<Regulation>>({
    ...regulation,
  });
  const [history, setHistory] = useState<StateTransition[]>(regulation.stateHistory ?? []);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const availableTransitions = useMemo(() => getAvailableTransitions((draft.state as WorkflowState) || regulation.state), [draft.state, regulation.state]);

  const handleFieldChange = (field: keyof Regulation, value: any) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (value: string) => {
    setDraft((prev) => ({ ...prev, publicationDate: new Date(value) }));
  };

  const handleStateTransition = (nextState: WorkflowState) => {
    const previousState = (draft.state as WorkflowState) || regulation.state;
    setHistory((prev) => [
      ...prev,
      {
        fromState: previousState,
        toState: nextState,
        timestamp: new Date(),
        userId: 'current-user',
        userRole: 'ADMIN',
      },
    ]);
    setDraft((prev) => ({ ...prev, state: nextState }));
  };

  const uploadFileIfNeeded = async (): Promise<string | undefined> => {
    if (!pdfFile) return draft.fileUrl ?? draft.pdfUrl ?? regulation.fileUrl ?? regulation.pdfUrl;

    const formData = new FormData();
    formData.append('file', pdfFile);

    const response = await fetch('/api/uploads/regulation-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('No se pudo subir el PDF');
    }

    const json = await response.json();
    return json.url as string;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadFileIfNeeded();
      await onSave({
        ...draft,
        fileUrl: uploadedUrl ?? draft.fileUrl ?? regulation.fileUrl,
        pdfUrl: uploadedUrl ?? draft.pdfUrl ?? regulation.pdfUrl,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isoDate = draft.publicationDate ? format(draft.publicationDate as Date, 'yyyy-MM-dd') : (regulation.publicationDate ? format(regulation.publicationDate, 'yyyy-MM-dd') : '');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Editor de Normativa</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Editar normativa</h1>
          <p className="text-gray-600 mt-1">Modifica metadatos, archivo PDF y estado.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button variant="secondary" onClick={() => {
            setDraft({ ...regulation });
            setHistory(regulation.stateHistory ?? []);
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadatos</CardTitle>
              <CardDescription>Datos que alimentan el encabezado oficial y el workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo de documento</label>
                  <Select value={(draft.type || regulation.type)} onChange={(e) => handleFieldChange('type', e.target.value as RegulationType)}>
                    <option value="DECREE">Decreto</option>
                    <option value="RESOLUTION">Resolución</option>
                    <option value="ORDINANCE">Ordenanza</option>
                    <option value="TRIBUNAL_RESOLUTION">Resolución Tribunal</option>
                    <option value="BID">Licitación</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <Select value={(draft.state || regulation.state)} onChange={(e) => handleFieldChange('state', e.target.value as WorkflowState)}>
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
                  <Input value={draft.specialNumber ?? regulation.specialNumber} onChange={(e) => handleFieldChange('specialNumber', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Referencia / Expediente</label>
                  <Input value={draft.reference ?? regulation.reference} onChange={(e) => handleFieldChange('reference', e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de publicación</label>
                  <Input type="date" value={isoDate} onChange={(e) => handleDateChange(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Título</label>
                <Input value={draft.specialNumber ? draft.specialNumber : regulation.specialNumber} onChange={(e) => handleFieldChange('specialNumber', e.target.value)} />
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
                <Input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
                <p className="text-xs text-gray-500 mt-1">Se espera un PDF completo y firmado digitalmente. Este editor solo asocia el archivo.</p>
              </div>
              {pdfFile && <div className="text-sm text-gray-700">Archivo seleccionado: <span className="font-medium">{pdfFile.name}</span></div>}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setPdfFile(null)} disabled={isSaving}>
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
                <Badge className="text-sm py-1 px-3">{stateLabels[(draft.state as WorkflowState) || regulation.state]}</Badge>
                <span className="text-xs text-gray-500">{(draft.type as RegulationType) || regulation.type}</span>
              </div>
              {availableTransitions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Mover a:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTransitions.map((state) => (
                      <Button key={state} variant="outline" size="sm" onClick={() => handleStateTransition(state)}>
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
                        <p className="text-gray-500">{format(item.timestamp, 'dd/MM/yyyy HH:mm')} · {item.userRole}</p>
                        {item.notes && <p className="text-gray-500 text-xs">{item.notes}</p>}
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
