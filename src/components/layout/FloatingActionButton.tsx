'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-secondary hover:bg-accent z-50"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
