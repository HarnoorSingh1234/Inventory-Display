'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { YarnItem } from '@/lib/types/admin.types';
import { Loader2, Save, Trash2 } from 'lucide-react';

interface ItemEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: YarnItem | null;
  onSave: (data: { count: string; quality: string; rate: number; show_on_homepage: boolean }) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function ItemEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: ItemEditDialogProps) {
  // Initialize form data from item when dialog opens
  const initialFormData = useMemo(() => ({
    count: item?.count || '',
    quality: item?.quality || '',
    rate: item?.rate || 0,
    show_on_homepage: item?.show_on_homepage ?? true,
  }), [item?.count, item?.quality, item?.rate, item?.show_on_homepage]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initialFormData changes
  if (item && (formData.count !== item.count || formData.quality !== item.quality)) {
    setFormData(initialFormData);
  }

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl md:text-2xl">✏️</span>
            </div>
            <div>
              <DialogTitle className="text-xl md:text-2xl">Edit Yarn Item</DialogTitle>
              <p className="text-xs md:text-sm text-gray-600">Update item details</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 md:space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-2">
              <Label htmlFor="count">
                Count <span className="text-red-500">*</span>
              </Label>
              <Input
                id="count"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                placeholder="e.g., 75/36, 150/48"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">
                Quality <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quality"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                placeholder="e.g., SD, FD, BR"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">
              Rate (₹/kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 md:p-4">
            <Checkbox
              id="show_on_homepage"
              checked={formData.show_on_homepage}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, show_on_homepage: checked as boolean })
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="show_on_homepage"
                className="text-sm md:text-base font-bold cursor-pointer"
              >
                Show on Homepage
              </Label>
              <p className="text-xs md:text-sm text-gray-600">Make this item visible to customers</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.count.trim() || !formData.quality.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting || isSaving}
            variant="destructive"
            className="sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isDeleting}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
