import { NextResponse } from 'next/server';
import { getUsers, updateUserBudget } from '@/lib/postgres';

export async function GET() {
  try {
    console.log('API: Fetching users from PostgreSQL...');
    const users = await getUsers();
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
    await updateUserBudget(userId, budgetCap);
    
    // Get the updated user data
    const users = await getUsers();
    const updatedUser = users.find(user => user.id === userId);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('API: Failed to update user budget:', error);
    return NextResponse.json({ error: 'Failed to update user budget' }, { status: 500 });
  }
}
