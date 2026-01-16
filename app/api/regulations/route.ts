import { NextRequest, NextResponse } from 'next/server';
import { getRegulations } from '@/lib/mockData';
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

  const regulations = getRegulations(filters);

  return NextResponse.json({
    success: true,
    data: regulations,
    count: regulations.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real app, this would create a new regulation in the database
    const newRegulation = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      state: 'DRAFT',
      stateHistory: [
        {
          fromState: null,
          toState: 'DRAFT',
          timestamp: new Date(),
          userId: 'current-user',
          userRole: 'ADMIN',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
