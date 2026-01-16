import { NextRequest, NextResponse } from 'next/server';
import { getRegulationById } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  return NextResponse.json({
    success: true,
    data: regulation,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
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

    // In a real app, this would update the regulation in the database
    const updatedRegulation = {
      ...regulation,
      ...body,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: 'Regulation updated successfully',
      data: updatedRegulation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating regulation',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  // In a real app, this would delete the regulation from the database
  return NextResponse.json({
    success: true,
    message: 'Regulation deleted successfully',
  });
}
