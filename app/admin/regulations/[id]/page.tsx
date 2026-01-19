'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Regulation, WorkflowState } from '@/types';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import RegulationForm from '@/components/RegulationForm';
import AdminRegulationEditor from '@/components/AdminRegulationEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { normalizeRegulation } from '@/lib/utils';

export default function AdminRegulationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const fetchData = async () => {
        const response = await fetch(`/api/regulations/${params.id}`);
        if (!response.ok) {
          setRegulation(null);
          return;
        }
        const json = await response.json();
        setRegulation(normalizeRegulation(json.data));
      };

      fetchData();
    }
  }, [params?.id]);

  if (!regulation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Normativa no encontrada.</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push('/admin')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Administración
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async (updatedRegulation: Partial<Regulation>) => {
    if (!regulation) return;

    const response = await fetch(`/api/regulations/${regulation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRegulation),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la normativa');
    }

    const json = await response.json();
    setRegulation(normalizeRegulation(json.data));
    setIsEditing(false);
    router.push('/admin');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('¿Está seguro de que desea eliminar esta normativa?')) {
      const remove = async () => {
        const response = await fetch(`/api/regulations/${regulation?.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          alert('Error al eliminar la normativa');
          return;
        }

        alert('Normativa eliminada exitosamente');
        router.push('/admin');
      };

      remove();
    }
  };

  const handleStateTransition = (newState: WorkflowState) => {
    if (confirm(`¿Está seguro de cambiar el estado a ${newState}?`)) {
      const transition = async () => {
        const response = await fetch(`/api/regulations/${regulation?.id}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toState: newState }),
        });

        if (!response.ok) {
          alert('Transición de estado inválida');
          return;
        }

        const json = await response.json();
        setRegulation(normalizeRegulation(json.data));
        router.push('/admin');
      };

      transition();
    }
  };

  const getAvailableTransitions = (): WorkflowState[] => {
    switch (regulation.state) {
      case 'DRAFT':
        return ['REVIEW'];
      case 'REVIEW':
        return ['APPROVED', 'DRAFT'];
      case 'APPROVED':
        return ['PUBLISHED', 'REVIEW'];
      case 'PUBLISHED':
        return ['ARCHIVED'];
      case 'ARCHIVED':
        return [];
      default:
        return [];
    }
  };

  const getStateLabel = (state: WorkflowState): string => {
    const labels: Record<WorkflowState, string> = {
      DRAFT: 'Borrador',
      REVIEW: 'En Revisión',
      APPROVED: 'Aprobado',
      PUBLISHED: 'Publicado',
      ARCHIVED: 'Archivado',
    };
    return labels[state];
  };

  const getTypeLabel = (type: string) => {
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
      default:
        return type;
    }
  };

  const getLegalStatusLabel = (status?: string) => {
    switch (status) {
      case 'VIGENTE':
        return 'Vigente';
      case 'PARCIAL':
        return 'Parcialmente vigente';
      case 'SIN_ESTADO':
      default:
        return 'Sin estado';
    }
  };

  const handleDownload = () => {
    const storedUrl = regulation?.fileUrl || regulation?.pdfUrl;
    if (storedUrl) {
      window.open(storedUrl, '_blank', 'noopener');
      return;
    }
    if (regulation) {
      downloadRegulationPDF(regulation);
    }
  };

  if (isEditing) {
    return (
      <AdminRegulationEditor regulation={regulation} onSave={handleSave} onCancel={handleCancel} />
    );
  }

  const availableTransitions = getAvailableTransitions();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Detalle de normativa</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {regulation.specialNumber}
          </h1>
          <p className="text-gray-600 mt-1">{regulation.reference}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push('/admin')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Administración
          </Button>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button onClick={handleDelete} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge className="mb-2">{getTypeLabel(regulation.type)}</Badge>
                  <CardTitle className="text-2xl md:text-3xl">{regulation.specialNumber}</CardTitle>
                  <CardDescription className="text-lg mt-2">{regulation.reference}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Publicación</p>
                  <p className="font-medium">{format(regulation.publicationDate, 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado Legal</p>
                  <p className="font-medium">{getLegalStatusLabel(regulation.legalStatus)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Palabras Clave</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {regulation.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {(regulation.fileUrl || regulation.pdfUrl) && (
                <div>
                  <p className="text-sm text-gray-600">Documento Original</p>
                  <a
                    className="text-blue-600 underline"
                    href={regulation.fileUrl || regulation.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver PDF
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {regulation.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h1 key={index} className="text-2xl font-bold mt-6 mb-4">
                        {paragraph.replace('# ', '')}
                      </h1>
                    );
                  } else if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-xl font-semibold mt-4 mb-3">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  } else if (paragraph.trim()) {
                    return (
                      <p key={index} className="mb-3 text-gray-700">
                        {paragraph}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>Gestiona el flujo de aprobación de la normativa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="text-lg py-2 px-4">{getStateLabel(regulation.state)}</Badge>
                <span className="text-xs text-gray-500">{getTypeLabel(regulation.type)}</span>
              </div>

              {availableTransitions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Transiciones disponibles</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTransitions.map((state) => (
                      <Button
                        key={state}
                        onClick={() => handleStateTransition(state)}
                        variant="outline"
                        size="sm"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {getStateLabel(state)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Historial</p>
                <div className="space-y-2">
                  {regulation.stateHistory.map((transition, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {transition.fromState ? (
                            <>{getStateLabel(transition.fromState)} → {getStateLabel(transition.toState)}</>
                          ) : (
                            <>Creado como {getStateLabel(transition.toState)}</>
                          )}
                        </p>
                        <p className="text-gray-500">
                          {format(transition.timestamp, 'dd/MM/yyyy HH:mm')} - {transition.userRole}
                        </p>
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
