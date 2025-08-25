'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { User, Category, IOUWithDetails } from '@/lib/types';
import { getCategories, getIOUsForUser, addIOU, updateIOUStatus, addSpending, deleteIOU } from '@/lib/db';
import { Plus, Check, X, Trash2 } from 'lucide-react';

interface PinjamPageProps {
  currentUser: User;
}

export default function PinjamPage({ currentUser }: PinjamPageProps) {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [isAddPinjamOpen, setIsAddPinjamOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ious, setIOUs] = useState<IOUWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [iouToDelete, setIOUToDelete] = useState<IOUWithDetails | null>(null);

  const fetchData = async () => {
    try {
      const [categoriesData, iousData] = await Promise.all([
        getCategories(),
        getIOUsForUser(currentUser.id, activeTab)
      ]);
      setCategories(categoriesData);
      setIOUs(iousData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id, activeTab]);

  // Filter IOUs based on current user and tab
  const filteredIOUs = ious;

  const handleAddPinjam = async () => {
    if (!title.trim() || !amount || !selectedCategory) return;

    try {
      const otherUserId = currentUser.id === 1 ? 2 : 1;
      await addIOU({
        fromUserId: currentUser.id,
        toUserId: otherUserId,
        title: title.trim(),
        amount: parseFloat(amount),
        categoryId: selectedCategory.id,
        notes: notes.trim() || undefined,
        date: new Date().toISOString(),
        status: 'pending'
      });

      // Reset form
      setTitle('');
      setAmount('');
      setSelectedCategory(null);
      setNotes('');
      setShowNotes(false);
      setIsAddPinjamOpen(false);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Failed to add pinjam:', error);
    }
  };

  const handleApprove = async (iouId: number) => {
    try {
      await updateIOUStatus(iouId, 'approved');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to approve pinjam:', error);
    }
  };

  const handleReject = async (iouId: number) => {
    try {
      await updateIOUStatus(iouId, 'rejected');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to reject pinjam:', error);
    }
  };

  const handleDeleteClick = (iou: IOUWithDetails) => {
    setIOUToDelete(iou);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!iouToDelete) return;
    
    try {
      await deleteIOU(iouToDelete.id);
      setDeleteDialogOpen(false);
      setIOUToDelete(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete pinjam:', error);
    }
  };

  const handlePayBack = async (iou: IOUWithDetails) => {
    try {
      // Add as expense to represent paying back the debt
      await addSpending({
        userId: currentUser.id,
        title: `💕 ${iou.title}`,
        amount: iou.amount,
        categoryId: iou.categoryId,
        notes: iou.notes || 'Debt repayment',
        date: new Date().toISOString(),
        isShared: false
      });

      // Mark the IOU as approved (paid)
      await updateIOUStatus(iou.id, 'approved');
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to pay back pinjam:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => `RM${amount.toFixed(2)}`;

  const quickCategories = categories.slice(0, 3);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">💝 Pinjam</h2>
          <p className="text-gray-600">Track what you owe and what others owe you</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'sent' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setActiveTab('sent')}
          >
            💸 I Owe
          </Button>
          <Button
            variant={activeTab === 'received' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setActiveTab('received')}
          >
            💰 Owed to Me
          </Button>
        </div>

        {/* Pinjam List */}
        <div className="space-y-3">
          {filteredIOUs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                {activeTab === 'sent' ? 
                  "No pending debts" : 
                  "No one owes you money"
                }
              </CardContent>
            </Card>
          ) : (
            filteredIOUs
              .sort((a, b) => {
                // Sort by status: pending items first, then approved/rejected
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return 0;
              })
              .map((iou) => (
              <Card key={iou.id}>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    {/* Color bar */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    ></div>
                    
                    <div className="flex items-center space-x-3 ml-3 flex-1">
                      <div className="text-xl">{iou.categoryEmoji}</div>
                      <div className="flex-1">
                        <div className="font-medium">{iou.title}</div>
                        {iou.notes && (
                          <div className="text-xs text-gray-400 mt-1">{iou.notes}</div>
                        )}
                        <div className="font-bold text-lg mt-1">{formatCurrency(iou.amount)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Action buttons for sent IOUs (I Owe) */}
                      {activeTab === 'sent' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handlePayBack(iou)}
                            variant={iou.status === 'approved' ? 'default' : 'outline'}
                            className={`h-8 w-8 p-0 border ${
                              iou.status === 'approved' 
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                                : 'text-gray-400 hover:text-green-600 border-gray-300 hover:border-green-600'
                            }`}
                            title={iou.status === 'approved' ? 'Paid back' : 'Mark as paid back'}
                            disabled={iou.status === 'approved'}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(iou)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      {/* Action buttons for received IOUs */}
                      {activeTab === 'received' && iou.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(iou.id)}
                            className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(iou.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(iou)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Pinjam Button */}
        {activeTab === 'sent' && (
          <Button
            onClick={() => setIsAddPinjamOpen(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add What I Owe
          </Button>
        )}

        {/* Add Pinjam Dialog */}
        <Dialog open={isAddPinjamOpen} onOpenChange={setIsAddPinjamOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>💸 Add What I Owe</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddPinjam(); }} className="space-y-4">
              <div>
                <label className="text-sm font-medium">What do you owe for? *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Coffee you bought me"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Amount (RM) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category *</label>
                
                {loading ? (
                  <div className="text-center py-4 text-gray-500">
                    Loading categories...
                  </div>
                ) : (
                  <>
                    {/* All Categories Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          type="button"
                          variant={selectedCategory?.id === category.id ? "default" : "outline"}
                          className="h-12 text-sm sm:text-sm px-2"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <span className="mr-1">{category.emoji}</span>
                          <span className="truncate">{category.name}</span>
                        </Button>
                        ))}
                    </div>
                  </>
                )}
              </div>

              {/* Notes Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Notes</label>
                <Button
                  type="button"
                  variant={showNotes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  {showNotes ? "Hide" : "Show"}
                </Button>
              </div>

              {showNotes && (
                <div>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details..."
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddPinjamOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!title.trim() || !amount || !selectedCategory}
                >
                  Add Pinjam
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bottom padding for navigation */}
        <div className="h-20"></div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Pinjam</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{iouToDelete?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
