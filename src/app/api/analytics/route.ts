import { NextResponse } from 'next/server';
import { 
  getMonthlyTotal, 
  getCombinedMonthlyTotal, 
  getSharedExpensesTotal, 
  getCategoryBreakdown 
} from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    switch (type) {
      case 'monthly':
        if (userId && month !== null && year !== null) {
          const total = getMonthlyTotal(parseInt(userId), parseInt(month), parseInt(year));
          return NextResponse.json({ total });
        }
        break;
      
      case 'combined':
        if (month !== null && year !== null) {
          const total = getCombinedMonthlyTotal(parseInt(month), parseInt(year));
          return NextResponse.json({ total });
        }
        break;
      
      case 'shared':
        if (month !== null && year !== null) {
          const total = getSharedExpensesTotal(parseInt(month), parseInt(year));
          return NextResponse.json({ total });
        }
        break;
      
      case 'category':
        const userIdParam = userId ? parseInt(userId) : undefined;
        const monthParam = month !== null ? parseInt(month) : undefined;
        const yearParam = year !== null ? parseInt(year) : undefined;
        const breakdown = getCategoryBreakdown(userIdParam, monthParam, yearParam);
        return NextResponse.json(breakdown);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
