import { NextRequest, NextResponse } from 'next/server';
import {
  addTransitionInDb,
  allowedTransitions,
  fetchRegulationByIdFromDb,
} from '@/lib/regulationService';
import { WorkflowState } from '@/types';

export async function POST(request: NextRequest, context: any) {
  try {
    const { params } = context ?? {};
    const { id } = (await params) ?? {};
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid id parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { toState, notes } = body;

    const regulation = await fetchRegulationByIdFromDb(id);

    if (!regulation) {
      return NextResponse.json(
        {
          success: false,
          message: 'Regulation not found',
        },
        { status: 404 }
      );
    }

    // Validate transition
    const allowed = allowedTransitions(regulation.state);
    if (!allowed.includes(toState)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid transition from ${regulation.state} to ${toState}`,
        },
        { status: 400 }
      );
    }

    const updatedRegulation = await addTransitionInDb(regulation, toState, notes);

    return NextResponse.json({
      success: true,
      message: `State transitioned from ${regulation.state} to ${toState}`,
      data: updatedRegulation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error transitioning state',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
