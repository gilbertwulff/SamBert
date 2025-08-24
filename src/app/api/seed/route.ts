import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { getStaticUsers } = await import('@/lib/static-users');
    const { getStaticCategories } = await import('@/lib/static-categories');
    
    console.log('Manual seeding triggered');
    
    const users = getStaticUsers();
    let categories;
    let seedStatus = 'unknown';
    
    // Try to seed Postgres first
    try {
      const { initializeDatabase, seedInitialData, getCategories } = await import('@/lib/postgres');
      
      await initializeDatabase();
      await seedInitialData();
      categories = await getCategories();
      seedStatus = 'postgres_seeded';
      
      console.log('Postgres seeding complete. Users:', users.length, 'Categories:', categories.length);
    } catch (postgresError) {
      console.error('Postgres seeding failed, using static categories:', postgresError);
      categories = getStaticCategories();
      seedStatus = 'postgres_failed_using_static';
    }
    
    return NextResponse.json({
      success: true,
      message: `Database seeding completed (${seedStatus})`,
      data: {
        users: users,
        categories: categories,
        userCount: users.length,
        categoryCount: categories.length,
        seedStatus: seedStatus
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
