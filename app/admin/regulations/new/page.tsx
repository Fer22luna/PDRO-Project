'use client';

import { useRouter } from 'next/navigation';
import { Regulation } from '@/types';
import RegulationForm from '@/components/RegulationForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewRegulationPage() {
  const router = useRouter();

  const handleSave = async (regulation: Partial<Regulation>) => {
    const response = await fetch('/api/regulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regulation),
    });

    if (!response.ok) {
      throw new Error('Error al crear la normativa');
    }

    alert('Normativa creada exitosamente como borrador');
    router.push('/admin');
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => router.push('/admin')} variant="outline" className="mb-4"  style={{
                background: "rgba(255, 255, 255, 0.1)",  // Fondo blanco semi-transparente
                color: "#6366F1",
                border: "2px solid #6366F1",
                backdropFilter: "blur(10px)"
              }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Administración
        </Button>
      </div>

      <Card className="shadow-xl border border-gray-100 bg-white/95 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-800">Nueva normativa</CardTitle>
          <CardDescription className="text-gray-600">Completa los campos para crear un borrador</CardDescription>
        </CardHeader>
        <CardContent className="text-gray-700">
          <RegulationForm onSave={handleSave} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
