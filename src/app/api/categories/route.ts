import { NextResponse } from 'next/server';
import { getCategories, addCategory } from '@/lib/database';

export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, emoji, color } = await request.json();
    const newCategory = addCategory(name, emoji, color);
    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
