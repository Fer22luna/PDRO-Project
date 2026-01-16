import { NextRequest, NextResponse } from 'next/server';
import { getRegulationById } from '@/lib/mockData';
import { WorkflowState } from '@/types';

const ALLOWED_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  DRAFT: ['REVIEW'],
  REVIEW: ['APPROVED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'REVIEW'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { toState, notes } = body;

    const regulation = getRegulationById(id);

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
    const allowedTransitions = ALLOWED_TRANSITIONS[regulation.state];
    if (!allowedTransitions.includes(toState)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid transition from ${regulation.state} to ${toState}`,
        },
        { status: 400 }
      );
    }

    // In a real app, this would update the regulation state in the database
    const newTransition = {
      fromState: regulation.state,
      toState,
      timestamp: new Date(),
      userId: 'current-user',
      userRole: 'ADMIN',
      notes,
    };

    const updatedRegulation = {
      ...regulation,
      state: toState,
      stateHistory: [...regulation.stateHistory, newTransition],
      updatedAt: new Date(),
    };

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
