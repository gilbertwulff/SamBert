'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getCategoryBreakdown } from '@/lib/db';
import { User } from '@/lib/types';

interface CategoryChartProps {
  currentUser: User;
  currentMonth: number;
  currentYear: number;
  viewMode: 'individual' | 'combined' | 'shared';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function CategoryChart({ 
  currentUser, 
  currentMonth, 
  currentYear, 
  viewMode 
}: CategoryChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = viewMode === 'individual' ? currentUser.id : undefined;
        const categoryData = await getCategoryBreakdown(userId, currentMonth, currentYear);
        setData(categoryData);
      } catch (error) {
        console.error('Failed to fetch category breakdown:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id, currentMonth, currentYear, viewMode]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Loading category data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No expenses recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">
            {data.payload.emoji} {data.payload.name}
          </p>
          <p className="text-blue-600">
            RM{data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📊 Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ emoji, value }) => `${emoji} RM${value.toFixed(0)}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.emoji} {item.name}</span>
              </div>
              <span className="font-medium">RM{item.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
