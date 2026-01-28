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
import type { TableGroup } from '@/lib/types/admin.types';
import { Loader2, Save, Trash2 } from 'lucide-react';

interface TableEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: TableGroup | null;
  onSave: (data: { table_name: string; show_on_homepage: boolean }) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function TableEditDialog({
  open,
  onOpenChange,
  table,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: TableEditDialogProps) {
  // Initialize form data from table when dialog opens
  const initialFormData = useMemo(() => ({
    table_name: table?.table_name || '',
    show_on_homepage: table?.show_on_homepage ?? true,
  }), [table?.table_name, table?.show_on_homepage]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initialFormData changes
  if (table && formData.table_name !== table.table_name) {
    setFormData(initialFormData);
  }

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl md:text-2xl">📋</span>
            </div>
            <div>
              <DialogTitle className="text-xl md:text-2xl">Edit Table Group</DialogTitle>
              <p className="text-xs md:text-sm text-gray-600">Update table settings</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 md:space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="table_name">
              Table Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="table_name"
              value={formData.table_name}
              onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
              placeholder="Enter table name"
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
              <p className="text-xs md:text-sm text-gray-600">Make this table visible to customers</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.table_name.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Done
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
