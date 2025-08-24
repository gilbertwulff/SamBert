import { NextResponse } from 'next/server';
import { getUsers, getUserById, updateUserBudget } from '@/lib/database';

export async function GET() {
  try {
    console.log('API: Attempting to fetch users...');
    
    // Try database first
    try {
      const users = getUsers();
      console.log('API: Users fetched from database successfully:', users.length);
      return NextResponse.json(users);
    } catch (dbError) {
      console.error('Database error, using fallback users:', dbError);
      
      // Fallback to hardcoded users for Vercel
      const fallbackUsers = [
        { id: 1, name: 'Bert', budgetCap: 3000 },
        { id: 2, name: 'Sam', budgetCap: 3000 }
      ];
      
      console.log('API: Using fallback users');
      return NextResponse.json(fallbackUsers);
    }
  } catch (error) {
    console.error('API: Complete failure:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
