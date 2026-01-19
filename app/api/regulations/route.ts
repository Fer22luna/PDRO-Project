import { NextRequest, NextResponse } from 'next/server';
import {
  createRegulationInDb,
  fetchRegulationsFromDb,
} from '@/lib/regulationService';
import { RegulationType, WorkflowState } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const filters = {
    type: searchParams.get('type') as RegulationType | undefined,
    state: searchParams.get('state') as WorkflowState | undefined,
    searchText: searchParams.get('search') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
  };

  try {
    const regulations = await fetchRegulationsFromDb(filters);

    return NextResponse.json({
      success: true,
      data: regulations,
      count: regulations.length,
    });
  } catch (error) {
    // Log full error server-side for debugging
    console.error('Error in GET /api/regulations', error);

    const safeMessage = error instanceof Error ? error.message : 'Unknown error';
    // Attempt to parse serialized Supabase error
    let parsed: any = safeMessage;
    try {
      parsed = JSON.parse(safeMessage);
    } catch (e) {
      // not JSON, keep raw
    }

    // If Supabase reports an invalid API key, return a clearer 401 with guidance
    const messageText = typeof parsed === 'string' ? parsed : parsed?.message ?? String(parsed);
    if (typeof messageText === 'string' && messageText.includes('Invalid API key')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Supabase API key',
          error: {
            detail: 'Verifica que las variables de entorno SUPABASE_SERVICE_ROLE_KEY (server) y NEXT_PUBLIC_SUPABASE_ANON_KEY (cliente) estén definidas y sean correctas.',
            raw: parsed,
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching regulations',
        error: parsed,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newRegulation = await createRegulationInDb(body);

    return NextResponse.json({
      success: true,
      message: 'Regulation created successfully',
      data: newRegulation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating regulation',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
