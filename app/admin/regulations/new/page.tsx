'use client';

import { useRouter } from 'next/navigation';
import { Regulation } from '@/types';
import RegulationForm from '@/components/RegulationForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewRegulationPage() {
  const router = useRouter();

  const handleSave = (regulation: Partial<Regulation>) => {
    // In a real app, this would make an API call
    console.log('Creating new regulation:', regulation);
    
    // Show success message (in a real app, use a toast notification)
    alert('Normativa creada exitosamente como borrador');
    
    // Redirect to admin page
    router.push('/admin');
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => router.push('/admin')} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Administración
        </Button>
      </div>

      <RegulationForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
