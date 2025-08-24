import { NextResponse } from 'next/server';
import { 
  getMonthlyTotal, 
  getCombinedMonthlyTotal, 
  getSharedExpensesTotal, 
  getCategoryBreakdown 
} from '@/lib/postgres';

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
          const total = await getMonthlyTotal(parseInt(userId), parseInt(month), parseInt(year));
          return NextResponse.json({ total });
        }
        break;
      
      case 'combined':
        if (month !== null && year !== null) {
          const total = await getCombinedMonthlyTotal(parseInt(month), parseInt(year));
          return NextResponse.json({ total });
        }
        break;
      
      case 'shared':
        if (month !== null && year !== null) {
          const total = await getSharedExpensesTotal(parseInt(month), parseInt(year));
          return NextResponse.json({ total });
        }
        break;
      
      case 'category':
        const userIdParam = userId ? parseInt(userId) : 1;
        const monthParam = month !== null ? parseInt(month) : new Date().getMonth();
        const yearParam = year !== null ? parseInt(year) : new Date().getFullYear();
        const breakdown = await getCategoryBreakdown(userIdParam, monthParam, yearParam);
        return NextResponse.json(breakdown);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
