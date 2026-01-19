import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRegulationByIdFromDb,
  updateRegulationInDb,
} from '@/lib/regulationService';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest, context: any) {
  // In some Next versions `context.params` can be a Promise. Await safely.
  const { params } = context ?? {};
  const { id } = (await params) ?? {};
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, message: 'Missing or invalid id parameter' }, { status: 400 });
  }

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

  return NextResponse.json({
    success: true,
    data: regulation,
  });
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const { params } = context ?? {};
    const { id } = (await params) ?? {};
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing or invalid id parameter' }, { status: 400 });
    }
    const body = await request.json();
    const existing = await fetchRegulationByIdFromDb(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Regulation not found',
        },
        { status: 404 }
      );
    }

    const updatedRegulation = await updateRegulationInDb(id, body);

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

export async function DELETE(request: NextRequest, context: any) {
  const { params } = context ?? {};
  const { id } = (await params) ?? {};
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, message: 'Missing or invalid id parameter' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();

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

  const { error } = await supabase.from('regulations').delete().eq('id', id);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting regulation',
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Regulation deleted successfully',
  });
}
