import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Import database functions dynamically to ensure fresh execution
    const { seedData, getUsers, getCategories } = await import('@/lib/database');
    
    console.log('Manual seeding triggered');
    
    // Force re-run the seeding
    await seedData();
    
    // Get current data to verify
    const users = getUsers();
    const categories = getCategories();
    
    console.log('Seeding complete. Users:', users.length, 'Categories:', categories.length);
    
    return NextResponse.json({
      success: true,
      message: 'Database seeding completed',
      data: {
        users: users,
        categories: categories,
        userCount: users.length,
        categoryCount: categories.length
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Just check current state without seeding
    const { getUsers, getCategories } = await import('@/lib/database');
    
    const users = getUsers();
    const categories = getCategories();
    
    return NextResponse.json({
      success: true,
      message: 'Database status retrieved',
      data: {
        users: users,
        categories: categories,
        userCount: users.length,
        categoryCount: categories.length
      }
    });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
