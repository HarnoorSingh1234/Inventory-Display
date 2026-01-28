'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { YarnItem, YarnItemCreate } from '@/lib/types/admin.types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';

interface EditableItemsTableProps {
  items: YarnItem[];
  onUpdateItem: (itemId: number, updates: Partial<YarnItemCreate>) => void;
  onDeleteItem: (itemId: number) => void;
  onCreateItem: (item: YarnItemCreate) => void;
  onBatchCreate: (items: YarnItemCreate[]) => void;
  onReorder: (reorderedItems: { id: number; display_order: number }[]) => void;
  isCreating: boolean;
  isDeleting: boolean;
}

interface NewRowData {
  id: string; // temporary id for React keys
  count: string;
  quality: string;
  rate: string;
  show_on_homepage: boolean;
}

interface SortableRowProps {
  item: YarnItem;
  onUpdate: (field: string, value: string | number | boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function SortableRow({ item, onUpdate, onDelete, isDeleting }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (field: string, value: string | number) => {
    setEditingField(field);
    setEditValue(String(value));
  };

  const handleSaveEdit = (field: string) => {
    if (field === 'rate') {
      onUpdate(field, parseFloat(editValue) || 0);
    } else {
      onUpdate(field, editValue);
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const renderCell = (field: 'count' | 'quality' | 'rate', value: string | number) => {
    if (editingField === field) {
      return (
        <Input
          autoFocus
          type={field === 'rate' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveEdit(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          className="h-8"
        />
      );
    }

    return (
      <div
        onClick={() => handleStartEdit(field, value)}
        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded min-h-[32px] flex items-center"
      >
        {field === 'rate' ? (
          <span className="font-bold text-blue-600">{formatCurrency(Number(value))}</span>
        ) : field === 'count' ? (
          <span className="font-semibold">{value || '—'}</span>
        ) : (
          <span>{value || '—'}</span>
        )}
      </div>
    );
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 bg-white">
      <td className="px-2 py-2 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
      </td>
      <td className="px-4 py-2 text-center font-medium">{item.display_order + 1}</td>
      <td className="px-4 py-2">{renderCell('count', item.count)}</td>
      <td className="px-4 py-2">{renderCell('quality', item.quality)}</td>
      <td className="px-4 py-2">{renderCell('rate', item.rate)}</td>
      <td className="px-4 py-2 text-center">
        <Checkbox
          checked={item.show_on_homepage}
          onCheckedChange={(checked) => onUpdate('show_on_homepage', !!checked)}
        />
      </td>
      <td className="px-4 py-2 text-center">
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

export function EditableItemsTable({
  items,
  onUpdateItem,
  onDeleteItem,
  onBatchCreate,
  onReorder,
  isCreating,
  isDeleting,
}: EditableItemsTableProps) {
  const [newRows, setNewRows] = useState<NewRowData[]>([]);
  const [orderedItems, setOrderedItems] = useState<YarnItem[]>(items);

  // Sync orderedItems when items prop changes
  if (items !== orderedItems && items.length !== orderedItems.length) {
    setOrderedItems([...items].sort((a, b) => a.display_order - b.display_order));
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
      const newIndex = orderedItems.findIndex((item) => item.id === over.id);
      
      const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
      setOrderedItems(newOrder);
      
      // Send reorder request
      const reorderData = newOrder.map((item, index) => ({
        id: item.id,
        display_order: index,
      }));
      onReorder(reorderData);
    }
  };

  const handleAddRow = () => {
    setNewRows(prev => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random()}`,
        count: '',
        quality: '',
        rate: '',
        show_on_homepage: true,
      },
    ]);
  };

  const handleNewRowChange = (id: string, field: keyof NewRowData, value: string | boolean) => {
    setNewRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveNewRow = (id: string) => {
    setNewRows(prev => prev.filter(row => row.id !== id));
  };

  const handleSaveAllNewRows = () => {
    const validRows = newRows.filter(row => row.count.trim() && row.quality.trim());
    
    if (validRows.length === 0) {
      alert('Please fill in count and quality for at least one row');
      return;
    }

    const itemsToCreate: YarnItemCreate[] = validRows.map((row, index) => ({
      count: row.count.trim(),
      quality: row.quality.trim(),
      rate: parseFloat(row.rate) || 0,
      display_order: orderedItems.length + index,
      show_on_homepage: row.show_on_homepage,
    }));

    onBatchCreate(itemsToCreate);
    setNewRows([]);
  };

  const handleUpdateItem = (itemId: number, field: string, value: string | number | boolean) => {
    onUpdateItem(itemId, { [field]: value } as Partial<YarnItemCreate>);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Items</h3>
          <p className="text-sm text-gray-600">
            Drag rows to reorder. Click cells to edit.
          </p>
        </div>
        <Button onClick={handleAddRow} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Row
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-2 py-3 w-10"></th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 w-16">S.No</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Count</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Quality</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Rate (₹/kg)</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 w-20">Visible</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <SortableContext
                  items={orderedItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedItems.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onUpdate={(field, value) => handleUpdateItem(item.id, field, value)}
                      onDelete={() => onDeleteItem(item.id)}
                      isDeleting={isDeleting}
                    />
                  ))}
                </SortableContext>

                {/* New Rows Section */}
                {newRows.map((row) => (
                  <tr key={row.id} className="bg-green-50">
                    <td className="px-2 py-2 w-10">
                      <span className="text-green-600 text-xs font-medium">NEW</span>
                    </td>
                    <td className="px-4 py-2 text-center font-medium text-gray-400">—</td>
                    <td className="px-4 py-2">
                      <Input
                        value={row.count}
                        onChange={(e) => handleNewRowChange(row.id, 'count', e.target.value)}
                        placeholder="e.g., 75/36"
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={row.quality}
                        onChange={(e) => handleNewRowChange(row.id, 'quality', e.target.value)}
                        placeholder="e.g., SD, FD"
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={row.rate}
                        onChange={(e) => handleNewRowChange(row.id, 'rate', e.target.value)}
                        placeholder="0.00"
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Checkbox
                        checked={row.show_on_homepage}
                        onCheckedChange={(checked) => handleNewRowChange(row.id, 'show_on_homepage', !!checked)}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveNewRow(row.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {orderedItems.length === 0 && newRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No items yet. Click &quot;Add Row&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      {/* Save All Button for New Rows */}
      {newRows.length > 0 && (
        <div className="flex justify-end gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
          <span className="text-green-700 font-medium flex-1">
            {newRows.length} new row{newRows.length > 1 ? 's' : ''} pending
          </span>
          <Button
            variant="outline"
            onClick={() => setNewRows([])}
          >
            Cancel All
          </Button>
        </div>
      )}
    </div>
  );
}
