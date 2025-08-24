import { NextResponse } from 'next/server';
import { getCategories, addCategory, initializeDatabase, seedInitialData } from '@/lib/postgres';
import { getStaticCategories } from '@/lib/static-categories';

export async function GET() {
  try {
    // Try Postgres first
    try {
      await initializeDatabase();
      await seedInitialData();
      const categories = await getCategories();
      console.log('Categories fetched from Postgres:', categories.length);
      return NextResponse.json(categories);
    } catch (postgresError) {
      console.error('Postgres not available, using static categories:', postgresError);
      
      // Fallback to static categories
      const staticCategories = getStaticCategories();
      console.log('Using static categories:', staticCategories.length);
      return NextResponse.json(staticCategories);
    }
  } catch (error) {
    console.error('Complete failure in categories API:', error);
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
