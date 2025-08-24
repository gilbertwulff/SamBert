import { NextResponse } from 'next/server';
import { getIOUsWithDetails, addIOU, updateIOUStatus, deleteIOU } from '@/lib/postgres';

export async function GET() {
  try {
    const ious = await getIOUsWithDetails();
    return NextResponse.json(ious);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch IOUs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newIOU = await addIOU(body);
    return NextResponse.json(newIOU);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add IOU' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { iouId, status } = await request.json();
    await updateIOUStatus(iouId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update IOU status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { iouId } = await request.json();
    await deleteIOU(iouId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete IOU:', error);
    return NextResponse.json({ error: 'Failed to delete IOU' }, { status: 500 });
  }
}
