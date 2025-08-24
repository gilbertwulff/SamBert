import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try database first
    try {
      const { getCategories } = await import('@/lib/database');
      const categories = getCategories();
      return NextResponse.json(categories);
    } catch (dbError) {
      console.error('Database error, using fallback categories:', dbError);
      
      // Fallback categories for Vercel
      const fallbackCategories = [
        { id: 1, name: 'Food', emoji: '🍔', color: '#EF4444' },
        { id: 2, name: 'Grocery', emoji: '🛒', color: '#10B981' },
        { id: 3, name: 'Online Shopping', emoji: '📦', color: '#3B82F6' },
        { id: 4, name: 'Transport', emoji: '🚗', color: '#F59E0B' },
        { id: 5, name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
        { id: 6, name: 'Bills', emoji: '💡', color: '#6B7280' }
      ];
      
      return NextResponse.json(fallbackCategories);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, emoji, color } = await request.json();
    
    try {
      const { addCategory } = await import('@/lib/database');
      const newCategory = addCategory(name, emoji, color);
      return NextResponse.json(newCategory);
    } catch (dbError) {
      console.error('Database error in POST categories:', dbError);
      // For fallback, just return a mock category
      return NextResponse.json({ 
        id: Date.now(), 
        name, 
        emoji, 
        color: color || '#6B7280' 
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
