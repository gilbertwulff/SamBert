import { NextResponse } from 'next/server';
import { getUsers, getUserById, updateUserBudget, initializeDatabase, seedInitialData } from '@/lib/postgres';

export async function GET() {
  try {
    console.log('API: Fetching users from Postgres...');
    
    // Auto-initialize database if needed
    try {
      await initializeDatabase();
      await seedInitialData();
    } catch (initError) {
      console.log('Database already initialized or init failed:', initError);
    }
    
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
    const updatedUser = await getUserById(userId);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user budget' }, { status: 500 });
  }
}
