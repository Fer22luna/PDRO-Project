'use client';

import { useRouter } from 'next/navigation';
import { Regulation } from '@/types';
import RegulationForm from '@/components/RegulationForm';
import { toast } from 'sonner';

export default function NewRegulationPage() {
  const router = useRouter();

  const handleSave = async (regulation: Partial<Regulation>) => {
    try {
      const response = await fetch('/api/regulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regulation),
      });

      let json: any = null;
      try {
        json = await response.json();
      } catch (e) {
        // ignore parse errors
      }

      if (!response.ok) {
        const message = (json && (json.message || json.error)) || `Error ${response.status}`;
        throw new Error(message);
      }

      toast.success('Normativa creada', {
        description: 'El borrador ha sido creado exitosamente.',
      });
      router.push('/admin');
    } catch (error) {
      console.error('Error creating regulation', error);
      toast.error('Error al crear', {
        description: error instanceof Error ? error.message : 'No se pudo crear la normativa.',
      });
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  return (
    <>
      <a href="/admin" className="back-button">
        ← Volver a Administración
      </a>

      <div className="page-header">
        <h2>Nueva normativa</h2>
        <p>Completa los campos para crear un borrador</p>
      </div>

      <div className="form-card">
        <RegulationForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </>
  );
}
