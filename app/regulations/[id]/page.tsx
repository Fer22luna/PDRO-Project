'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Regulation } from '@/types';
import { downloadRegulationPDF } from '@/lib/pdfGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { normalizeRegulation } from '@/lib/utils';

export default function RegulationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [regulation, setRegulation] = useState<Regulation | null>(null);

  useEffect(() => {
    if (params?.id) {
      const fetchData = async () => {
        const response = await fetch(`/api/regulations/${params.id}`);
        if (!response.ok) {
          setRegulation(null);
          return;
        }
        const json = await response.json();
        const normalized = normalizeRegulation(json.data);
        if (normalized.state === 'PUBLISHED') {
          setRegulation(normalized);
        } else {
          setRegulation(null);
        }
      };

      fetchData();
    }
  }, [params?.id]);

  if (!regulation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Normativa no encontrada o no publicada.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push('/')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    const storedUrl = regulation.fileUrl || regulation.pdfUrl;
    if (storedUrl) {
      window.open(storedUrl, '_blank', 'noopener');
      return;
    }
    downloadRegulationPDF(regulation);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => router.push('/')} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Portal
        </Button>
      </div>

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
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Publicado: {format(regulation.publicationDate, 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-2 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {regulation.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado Legal:</p>
              <p className="font-medium">{getLegalStatusLabel(regulation.legalStatus)}</p>
            </div>
            {(regulation.fileUrl || regulation.pdfUrl) && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Documento Original:</p>
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
          </div>
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
  );
}
