'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { WhatsAppGroup } from '@/lib/types/admin.types';
import { Loader2, MessageSquare } from 'lucide-react';

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: WhatsAppGroup[];
  selectedGroups: number[];
  onToggleGroup: (groupId: number) => void;
  onSend: () => void;
  isSending: boolean;
}

export function BroadcastDialog({
  open,
  onOpenChange,
  groups,
  selectedGroups,
  onToggleGroup,
  onSend,
  isSending,
}: BroadcastDialogProps) {
  const activeGroups = groups.filter(g => g.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg md:text-xl">Send to WhatsApp?</DialogTitle>
              <p className="text-xs md:text-sm text-gray-600">Broadcast updated inventory</p>
            </div>
          </div>
        </DialogHeader>

        {activeGroups.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 md:p-4 my-4">
            <p className="text-yellow-800 text-xs md:text-sm font-medium">
              No active WhatsApp groups. Add groups first.
            </p>
          </div>
        ) : (
          <div className="my-4">
            <Label className="text-xs md:text-sm font-semibold text-gray-700 mb-3 block">
              Select Groups:
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-blue-100 rounded-xl p-2 md:p-3">
              {activeGroups.map(group => (
                <label
                  key={group.id}
                  className="flex items-center gap-2 md:gap-3 hover:bg-blue-50 p-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => onToggleGroup(group.id)}
                  />
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    {group.group_name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            onClick={onSend}
            disabled={isSending || selectedGroups.length === 0}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            variant="outline"
            className="flex-1"
          >
            Skip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
