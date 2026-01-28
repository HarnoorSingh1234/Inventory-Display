'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { YarnItem, TableGroup } from '@/lib/types/admin.types';
import { formatCurrency } from '@/lib/utils';
import { Eye, Plus, Edit, Loader2 } from 'lucide-react';

interface InventoryPreviewProps {
  selectedTable: TableGroup | undefined;
  items: YarnItem[];
  previewMode: 'desktop' | 'mobile';
  isLoading: boolean;
  onAddItem: () => void;
  onEditItem: (item: YarnItem) => void;
  isCreating: boolean;
}

export function InventoryPreview({
  selectedTable,
  items,
  previewMode,
  isLoading,
  onAddItem,
  onEditItem,
  isCreating,
}: InventoryPreviewProps) {
  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-32 border-2 border-blue-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-700 font-medium text-lg">Loading items...</p>
        </div>
      </Card>
    );
  }

  if (!selectedTable) {
    return (
      <Card className="p-8 md:p-16 text-center border-2 border-blue-100">
        <div className="text-6xl md:text-8xl mb-6 text-blue-200">📋</div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No Table Selected</h3>
        <p className="text-gray-600 text-base md:text-lg">Select a table group from the sidebar</p>
      </Card>
    );
  }

  const visibleItems = items.filter(item => item.show_on_homepage);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card className="p-4 md:p-6 border-2 border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Eye className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedTable.table_name}</h2>
              <p className="text-blue-600 mt-1 text-xs md:text-sm">Customer Preview</p>
            </div>
          </div>
          <Button
            onClick={onAddItem}
            disabled={isCreating}
            className="bg-gradient-to-r from-green-500 to-green-600"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Preview Container */}
      <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-full'}`}>
        <div className={`bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 rounded-2xl shadow-inner ${
          previewMode === 'mobile' ? 'border-8 border-gray-800 rounded-3xl' : ''
        }`}>
          {previewMode === 'mobile' && (
            <div className="mb-4 text-center">
              <div className="bg-gray-800 h-6 w-32 mx-auto rounded-full mb-2"></div>
              <p className="text-xs text-gray-600 font-semibold">Mobile View (375px)</p>
            </div>
          )}
          
          <Card className="overflow-hidden border-2 border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-3 md:py-5">
              <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                <span className="w-1.5 md:w-2 h-6 md:h-8 bg-white rounded-full"></span>
                {selectedTable.table_name}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-blue-50">
                  <TableRow>
                    <TableHead className="font-bold text-blue-900">S.No</TableHead>
                    <TableHead className="font-bold text-blue-900">Count</TableHead>
                    <TableHead className="font-bold text-blue-900">Quality</TableHead>
                    <TableHead className="font-bold text-blue-900">Rate (₹/kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-6xl text-blue-200">📦</div>
                          <p className="text-blue-600 font-medium text-lg">No visible items</p>
                          <Button
                            onClick={onAddItem}
                            size="sm"
                            className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600"
                          >
                            Add your first item
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-blue-50/50">
                        <TableCell className="font-medium text-blue-900">{item.serial_number}</TableCell>
                        <TableCell className="font-semibold">{item.count || '—'}</TableCell>
                        <TableCell>{item.quality || '—'}</TableCell>
                        <TableCell>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(item.rate)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {previewMode === 'mobile' && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">End of mobile preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Edit Table */}
      <Card className="p-4 md:p-6 border-2 border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Items
          </h3>
          <Badge variant="secondary">
            {items.length} total items
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-6xl text-gray-200">📦</div>
                      <p className="text-gray-600 font-medium text-lg">No items yet</p>
                      <Button
                        onClick={onAddItem}
                        size="sm"
                        className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600"
                      >
                        Add your first item
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="group cursor-pointer"
                    onClick={() => onEditItem(item)}
                  >
                    <TableCell className="font-medium">{item.serial_number}</TableCell>
                    <TableCell className="font-semibold">{item.count || '—'}</TableCell>
                    <TableCell>{item.quality || '—'}</TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(item.rate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant={item.show_on_homepage ? 'default' : 'secondary'}>
                          {item.show_on_homepage ? '👁️' : '🚫'}
                        </Badge>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
