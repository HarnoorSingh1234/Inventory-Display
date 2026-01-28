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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TableGroup } from '@/lib/types/admin.types';
import { Loader2, FolderOpen, Edit, GripVertical } from 'lucide-react';

interface TableGroupSidebarProps {
  tableGroups: TableGroup[];
  selectedTable: number | null;
  onSelectTable: (id: number) => void;
  onEditTable: (table: TableGroup) => void;
  isCreating: boolean;
  onCreateTable: (name: string) => void;
  onReorderTables: (reorderedTables: { id: number; display_order: number }[]) => void;
}

interface SortableTableCardProps {
  table: TableGroup;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

function SortableTableCard({ table, isSelected, onSelect, onEdit }: SortableTableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-2 cursor-pointer transition-all hover:shadow-md group ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
          : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3 text-gray-400" />
        </button>
        
        <div className="flex-1" onClick={onSelect}>
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-xs truncate ${
                isSelected ? 'text-blue-900' : 'text-gray-700'
              }`}>
                {table.table_name}
              </h3>
              <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs px-1 py-0">
                {table.item_count}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          variant="ghost"
          size="sm"
          className="p-1 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}

export function TableGroupSidebar({
  tableGroups,
  selectedTable,
  onSelectTable,
  onEditTable,
  isCreating,
  onCreateTable,
  onReorderTables,
}: TableGroupSidebarProps) {
  const [showNewTableForm, setShowNewTableForm] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [orderedTables, setOrderedTables] = useState<TableGroup[]>(
    [...tableGroups].sort((a, b) => a.display_order - b.display_order)
  );

  // Sync orderedTables when tableGroups prop changes
  if (tableGroups.length !== orderedTables.length) {
    setOrderedTables([...tableGroups].sort((a, b) => a.display_order - b.display_order));
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
      const oldIndex = orderedTables.findIndex((table) => table.id === active.id);
      const newIndex = orderedTables.findIndex((table) => table.id === over.id);
      
      const newOrder = arrayMove(orderedTables, oldIndex, newIndex);
      setOrderedTables(newOrder);
      
      // Send reorder request
      const reorderData = newOrder.map((table, index) => ({
        id: table.id,
        display_order: index,
      }));
      onReorderTables(reorderData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    onCreateTable(newTableName);
    setNewTableName('');
    setShowNewTableForm(false);
  };

  return (
    <Card className="p-3 border-2 border-blue-100 lg:sticky lg:top-6">
      <h2 className="text-base font-bold mb-3 text-gray-900 flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-blue-600" />
        Table Groups
      </h2>

      {!showNewTableForm ? (
        <Button
          onClick={() => setShowNewTableForm(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 mb-3 text-sm"
          size="sm"
        >
          + Add Table Group
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-3 p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-md">
          <Input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Table name"
            className="mb-2 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isCreating || !newTableName.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-xs"
              size="sm"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                '✓ Create'
              )}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowNewTableForm(false);
                setNewTableName('');
              }}
              variant="outline"
              className="flex-1 text-xs"
              size="sm"
            >
              ✕ Cancel
            </Button>
          </div>
        </form>
      )}

      <p className="text-xs text-gray-500 mb-2">Drag to reorder</p>

      <div className="space-y-2 max-h-[400px] lg:max-h-[calc(100vh-350px)] overflow-y-auto">
        {orderedTables.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No tables yet</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedTables.map(table => table.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedTables.map(table => (
                <SortableTableCard
                  key={table.id}
                  table={table}
                  isSelected={selectedTable === table.id}
                  onSelect={() => onSelectTable(table.id)}
                  onEdit={() => onEditTable(table)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </Card>
  );
}
