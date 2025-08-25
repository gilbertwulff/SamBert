import { NextResponse } from 'next/server';
import { getCategories, addCategory, initializeDatabase, seedInitialData } from '@/lib/postgres';

export async function GET() {
  try {
    // Ensure database is initialized
    await initializeDatabase();
    await seedInitialData();
    
    const categories = await getCategories();
    console.log('Categories fetched from Postgres:', categories.length);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, emoji, color } = await request.json();
    
    // Validate required fields
    if (!name || !emoji) {
      return NextResponse.json({ 
        error: 'Name and emoji are required' 
      }, { status: 400 });
    }
    
    // Ensure database is initialized
    await initializeDatabase();
    
    const newCategory = await addCategory(name, emoji, color || '#6B7280');
    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Failed to add category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
