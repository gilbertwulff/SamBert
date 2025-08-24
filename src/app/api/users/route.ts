import { NextResponse } from 'next/server';
import { getUsers, getUserById, updateUserBudget } from '@/lib/database';

export async function GET() {
  try {
    const users = getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, budgetCap } = await request.json();
    updateUserBudget(userId, budgetCap);
    const updatedUser = getUserById(userId);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user budget' }, { status: 500 });
  }
}
