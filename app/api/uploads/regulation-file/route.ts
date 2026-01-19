import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'regulations';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'Falta el archivo PDF' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `regulations/${randomUUID()}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
      contentType: file.type || 'application/pdf',
      upsert: true,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    const url = publicData?.publicUrl;

    if (!url) {
      throw new Error('No se pudo obtener la URL pública del PDF');
    }

    return NextResponse.json({ success: true, url, path: filePath });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error subiendo el archivo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
