import { NextResponse } from 'next/server';
import { initializeDatabase, seedInitialData } from '@/lib/postgres';

export async function POST() {
  try {
    console.log('Initializing database...');
    
    // Initialize tables
    await initializeDatabase();
    
    // Seed initial data (Bert, Sam, and categories)
    await seedInitialData();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized and seeded successfully' 
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET() {
  return POST();
}
