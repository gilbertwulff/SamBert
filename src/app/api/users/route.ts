import { NextResponse } from 'next/server';
import { getStaticUsers, updateStaticUserBudget } from '@/lib/static-users';

export async function GET() {
  try {
    console.log('API: Fetching static users...');
    const users = getStaticUsers();
    console.log('API: Users fetched successfully:', users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error('API: Failed to fetch users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, budgetCap } = await request.json();
    const updatedUser = updateStaticUserBudget(userId, budgetCap);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user budget' }, { status: 500 });
  }
}
