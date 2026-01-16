'use client';

import { useState } from 'react';
import { Regulation, RegulationType, WorkflowState } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RegulationFormProps {
  regulation?: Regulation;
  onSave: (regulation: Partial<Regulation>) => void;
  onCancel: () => void;
}

export default function RegulationForm({ regulation, onSave, onCancel }: RegulationFormProps) {
  const [formData, setFormData] = useState({
    type: regulation?.type || 'DECREE' as RegulationType,
    specialNumber: regulation?.specialNumber || '',
    publicationDate: regulation?.publicationDate
      ? new Date(regulation.publicationDate).toISOString().split('T')[0]
      : '',
    reference: regulation?.reference || '',
    content: regulation?.content || '',
    keywords: regulation?.keywords.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const regulationData: Partial<Regulation> = {
      ...regulation,
      type: formData.type,
      specialNumber: formData.specialNumber,
      publicationDate: new Date(formData.publicationDate),
      reference: formData.reference,
      content: formData.content,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
    };

    onSave(regulationData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {regulation ? 'Editar Normativa' : 'Nueva Normativa'}
          </CardTitle>
          <CardDescription>
            Complete los campos para {regulation ? 'actualizar' : 'crear'} la normativa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              required
            >
              <option value="DECREE">Decreto</option>
              <option value="RESOLUTION">Resolución</option>
              <option value="ORDINANCE">Ordenanza</option>
            </Select>
          </div>

          {/* Special Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número Especial <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.specialNumber}
              onChange={(e) => handleChange('specialNumber', e.target.value)}
              placeholder="Ej: D-2024-001"
              required
            />
          </div>

          {/* Publication Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Publicación <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.publicationDate}
              onChange={(e) => handleChange('publicationDate', e.target.value)}
              required
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              placeholder="Breve descripción de la normativa"
              required
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Palabras Clave <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.keywords}
              onChange={(e) => handleChange('keywords', e.target.value)}
              placeholder="Separadas por comas: presupuesto, finanzas, 2024"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingrese palabras clave separadas por comas
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Contenido completo de la normativa. Use # para títulos principales y ## para subtítulos."
              rows={15}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: Use # para títulos y ## para subtítulos
            </p>
          </div>

          {/* Current State Badge */}
          {regulation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Actual
              </label>
              <Badge>{regulation.state}</Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {regulation ? 'Guardar Cambios' : 'Crear Normativa'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
