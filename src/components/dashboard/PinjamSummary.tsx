'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getIOUsForUser, updateIOUStatus } from '@/lib/db';
import { User, IOUWithDetails } from '@/lib/types';
import { Check, X } from 'lucide-react';

interface PinjamSummaryProps {
  currentUser: User;
}

export default function PinjamSummary({ currentUser }: PinjamSummaryProps) {
  const [sentIOUs, setSentIOUs] = useState<IOUWithDetails[]>([]);
  const [receivedIOUs, setReceivedIOUs] = useState<IOUWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIOUs = async () => {
      try {
        const [sent, received] = await Promise.all([
          getIOUsForUser(currentUser.id, 'sent'),
          getIOUsForUser(currentUser.id, 'received')
        ]);
        
        setSentIOUs(sent.filter(iou => iou.status === 'pending'));
        setReceivedIOUs(received.filter(iou => iou.status === 'pending'));
      } catch (error) {
        console.error('Failed to fetch IOUs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIOUs();
  }, [currentUser.id]);

  const handleApprove = async (iouId: number) => {
    try {
      await updateIOUStatus(iouId, 'approved');
      // Refresh the IOUs
      const [sent, received] = await Promise.all([
        getIOUsForUser(currentUser.id, 'sent'),
        getIOUsForUser(currentUser.id, 'received')
      ]);
      setSentIOUs(sent.filter(iou => iou.status === 'pending'));
      setReceivedIOUs(received.filter(iou => iou.status === 'pending'));
    } catch (error) {
      console.error('Failed to approve IOU:', error);
    }
  };

  const handleReject = async (iouId: number) => {
    try {
      await updateIOUStatus(iouId, 'rejected');
      // Refresh the IOUs
      const [sent, received] = await Promise.all([
        getIOUsForUser(currentUser.id, 'sent'),
        getIOUsForUser(currentUser.id, 'received')
      ]);
      setSentIOUs(sent.filter(iou => iou.status === 'pending'));
      setReceivedIOUs(received.filter(iou => iou.status === 'pending'));
    } catch (error) {
      console.error('Failed to reject IOU:', error);
    }
  };

  const formatCurrency = (amount: number) => `RM${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const totalSent = sentIOUs.reduce((sum, iou) => sum + iou.amount, 0);
  const totalReceived = receivedIOUs.reduce((sum, iou) => sum + iou.amount, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💝 Pinjam Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            Loading pinjam data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sentIOUs.length === 0 && receivedIOUs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💝 Pinjam Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No pending pinjam items
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">💝 Pinjam Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{formatCurrency(totalSent)}</div>
            <div className="text-xs text-red-500">I Owe</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{formatCurrency(totalReceived)}</div>
            <div className="text-xs text-green-500">Owed to Me</div>
          </div>
        </div>

        {/* Received IOUs (requiring action) */}
        {receivedIOUs.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">💰 Pending Approvals</h4>
            <div className="space-y-2">
              {receivedIOUs.slice(0, 3).map((iou) => (
                <div key={iou.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span>{iou.categoryEmoji}</span>
                    <div>
                      <div className="font-medium text-sm">{iou.title}</div>
                      <div className="text-xs text-gray-500">
                        {iou.fromUserName} • {formatDate(iou.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatCurrency(iou.amount)}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(iou.id)}
                        className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(iou.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {receivedIOUs.length > 3 && (
                <div className="text-center text-xs text-gray-500">
                  +{receivedIOUs.length - 3} more in Pinjam page
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sent IOUs */}
        {sentIOUs.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">💸 What I Owe</h4>
            <div className="space-y-2">
              {sentIOUs.slice(0, 2).map((iou) => (
                <div key={iou.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span>{iou.categoryEmoji}</span>
                    <div>
                      <div className="font-medium text-sm">{iou.title}</div>
                      <div className="text-xs text-gray-500">
                        to {iou.toUserName} • {formatDate(iou.date)}
                      </div>
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(iou.amount)}</span>
                </div>
              ))}
              {sentIOUs.length > 2 && (
                <div className="text-center text-xs text-gray-500">
                  +{sentIOUs.length - 2} more in Pinjam page
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
