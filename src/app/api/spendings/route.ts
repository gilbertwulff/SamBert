import { NextResponse } from 'next/server';
import { getSpendingsWithDetails, addSpending, addSharedSpending, deleteSpending } from '@/lib/database';

export async function GET() {
  try {
    const spendings = getSpendingsWithDetails();
    return NextResponse.json(spendings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch spendings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.isShared) {
      const { title, amount, categoryId, notes } = body;
      const spendings = addSharedSpending(title, amount, categoryId, notes);
      return NextResponse.json(spendings);
    } else {
      const newSpending = addSpending(body);
      return NextResponse.json(newSpending);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add spending' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { spendingId } = await request.json();
    deleteSpending(spendingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete spending:', error);
    return NextResponse.json({ error: 'Failed to delete spending' }, { status: 500 });
  }
}
