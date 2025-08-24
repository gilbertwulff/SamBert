import { NextResponse } from 'next/server';
import { VercelStorage } from '@/lib/vercel-storage';

export async function GET() {
  try {
    console.log('API: Fetching users from Vercel storage...');
    const users = VercelStorage.getUsers();
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
    VercelStorage.updateUserBudget(userId, budgetCap);
    const updatedUser = VercelStorage.getUserById(userId);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user budget' }, { status: 500 });
  }
}
