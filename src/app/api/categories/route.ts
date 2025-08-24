import { NextResponse } from 'next/server';
import { VercelStorage } from '@/lib/vercel-storage';

export async function GET() {
  try {
    const categories = VercelStorage.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, emoji, color } = await request.json();
    const newCategory = VercelStorage.addCategory(name, emoji, color);
    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
