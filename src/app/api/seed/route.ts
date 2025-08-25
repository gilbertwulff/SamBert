import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Manual seeding triggered');
    
    // Use the new reset and seed function
    const { initializeDatabase, resetAndSeedDatabase, getUsers, getCategories } = await import('@/lib/postgres');
    
    await initializeDatabase();
    await resetAndSeedDatabase();
    
    const users = await getUsers();
    const categories = await getCategories();
    
    console.log('Postgres reset and seeding complete. Users:', users.length, 'Categories:', categories.length);
    
    return NextResponse.json({
      success: true,
      message: 'Database reset and seeded successfully',
      data: {
        users: users,
        categories: categories,
        userCount: users.length,
        categoryCount: categories.length,
        seedStatus: 'postgres_reset_and_seeded'
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset and seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { getStaticUsers } = await import('@/lib/static-users');
    const { getStaticCategories } = await import('@/lib/static-categories');
    
    const users = getStaticUsers();
    let categories;
    let databaseStatus = 'unknown';
    
    // Try to get categories from Postgres first
    try {
      const { getCategories } = await import('@/lib/postgres');
      categories = await getCategories();
      databaseStatus = 'postgres_connected';
    } catch (postgresError) {
      console.log('Postgres not available, using static categories');
      categories = getStaticCategories();
      databaseStatus = 'using_static_fallback';
    }
    
    return NextResponse.json({
      success: true,
      message: `Database status retrieved (${databaseStatus})`,
      data: {
        users: users,
        categories: categories,
        userCount: users.length,
        categoryCount: categories.length,
        databaseStatus: databaseStatus
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
