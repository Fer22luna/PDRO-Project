'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Regulation, WorkflowState } from '@/types';
import { getRegulationById } from '@/lib/mockData';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import RegulationForm from '@/components/RegulationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminRegulationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const reg = getRegulationById(params.id);
      if (reg) {
        setRegulation(reg);
      }
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

  const handleSave = (updatedRegulation: Partial<Regulation>) => {
    console.log('Updating regulation:', updatedRegulation);
    alert('Normativa actualizada exitosamente');
    setIsEditing(false);
    router.push('/admin');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('¿Está seguro de que desea eliminar esta normativa?')) {
      console.log('Deleting regulation:', regulation.id);
      alert('Normativa eliminada exitosamente');
      router.push('/admin');
    }
  };

  const handleStateTransition = (newState: WorkflowState) => {
    if (confirm(`¿Está seguro de cambiar el estado a ${newState}?`)) {
      console.log('Transitioning state to:', newState);
      alert(`Estado cambiado a ${newState} exitosamente`);
      router.push('/admin');
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
      default:
        return type;
    }
  };

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={() => setIsEditing(false)} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar Edición
          </Button>
        </div>
        <RegulationForm regulation={regulation} onSave={handleSave} onCancel={handleCancel} />
      </div>
    );
  }

  const availableTransitions = getAvailableTransitions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => router.push('/admin')} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Administración
        </Button>
      </div>

      {/* Workflow State Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado del Workflow</CardTitle>
          <CardDescription>
            Gestiona el flujo de aprobación de la normativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Estado Actual:</p>
              <Badge className="text-lg py-2 px-4">
                {getStateLabel(regulation.state)}
              </Badge>
            </div>
            
            {availableTransitions.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Transiciones Disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTransitions.map((state) => (
                    <Button
                      key={state}
                      onClick={() => handleStateTransition(state)}
                      variant="outline"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {getStateLabel(state)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* State History */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3">Historial de Estados:</h4>
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

      {/* Regulation Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="mb-2">{getTypeLabel(regulation.type)}</Badge>
              <CardTitle className="text-2xl md:text-3xl">
                {regulation.specialNumber}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {regulation.reference}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={() => downloadRegulationPDF(regulation)}>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Fecha de Publicación:</p>
              <p className="font-medium">
                {format(regulation.publicationDate, 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Palabras Clave:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {regulation.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Card */}
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
  );
}
