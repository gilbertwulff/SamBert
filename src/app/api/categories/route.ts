import { NextResponse } from 'next/server';
import { getCategories, addCategory, initializeDatabase, seedInitialData } from '@/lib/postgres';

export async function GET() {
  try {
    // Auto-initialize database if needed (for categories only)
    try {
      await initializeDatabase();
      await seedInitialData();
    } catch (initError) {
      console.log('Database already initialized or init failed:', initError);
    }
    
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, emoji, color } = await request.json();
    const newCategory = await addCategory(name, emoji, color);
    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
