'use client';

import { useEffect, useState } from 'react';
import type { TableGroup, YarnItemCreate } from '@/lib/types/admin.types';
import {
  useTableGroups,
  useCreateTableGroup,
  useUpdateTableGroup,
  useDeleteTableGroup,
  useYarnItems,
  useCreateYarnItem,
  useUpdateYarnItem,
  useDeleteYarnItem,
  useBatchCreateYarnItems,
  useReorderYarnItems,
  useReorderTableGroups,
  useWhatsAppGroups,
  useSendBroadcast,
} from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/admin/inventory/LoadingSpinner';
import { TableGroupSidebar } from '@/components/admin/inventory/TableGroupSidebar';
import { EditableItemsTable } from '@/components/admin/inventory/EditableItemsTable';
import { TableEditDialog } from '@/components/admin/inventory/TableEditDialog';
import { BroadcastDialog } from '@/components/admin/inventory/BroadcastDialog';
import { Card } from '@/components/ui/card';
import { Save } from 'lucide-react';

export default function InventoryPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Table edit dialog state
  const [showEditTableDialog, setShowEditTableDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<TableGroup | null>(null);

  // Broadcast dialog state
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  // Track if changes were made
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track ALL pending operations
  const [pendingUpdates, setPendingUpdates] = useState<Map<number, Partial<YarnItemCreate>>>(new Map());
  const [pendingCreates, setPendingCreates] = useState<YarnItemCreate[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Set<number>>(new Set());
  const [pendingItemReorder, setPendingItemReorder] = useState<{ id: number; display_order: number }[] | null>(null);
  const [pendingTableReorder, setPendingTableReorder] = useState<{ id: number; display_order: number }[] | null>(null);
  const [pendingTableUpdates, setPendingTableUpdates] = useState<Map<number, { table_name: string; show_on_homepage: boolean }>>(new Map());

  // Ensure consistent hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // React Query hooks
  const { data: tableGroups = [], isLoading: loadingTables } = useTableGroups();
  const { data: items = [], isLoading: loadingItems } = useYarnItems(selectedTable);
  const { data: whatsappGroups = [] } = useWhatsAppGroups();

  // Mutations
  const createTableMutation = useCreateTableGroup();
  const updateTableMutation = useUpdateTableGroup();
  const deleteTableMutation = useDeleteTableGroup();
  const createItemMutation = useCreateYarnItem();
  const updateItemMutation = useUpdateYarnItem();
  const deleteItemMutation = useDeleteYarnItem();
  const batchCreateItemsMutation = useBatchCreateYarnItems();
  const reorderItemsMutation = useReorderYarnItems();
  const reorderTablesMutation = useReorderTableGroups();
  const sendBroadcastMutation = useSendBroadcast();

  // Auto-select first table when data loads
  useEffect(() => {
    if (tableGroups.length > 0 && selectedTable === null) {
      Promise.resolve().then(() => {
        setSelectedTable(tableGroups[0].id);
      });
    }
  }, [tableGroups, selectedTable]);


  const handleUpdateItem = (itemId: number, updates: Partial<YarnItemCreate>) => {
    if (!selectedTable) return;

    // Queue the update instead of executing immediately
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || {};
      newMap.set(itemId, { ...existing, ...updates });
      return newMap;
    });
    setHasUnsavedChanges(true);
  };

  const handleCreateItem = (item: YarnItemCreate) => {
    if (!selectedTable) return;

    // Queue the create instead of executing immediately
    setPendingCreates(prev => [...prev, item]);
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = (itemId: number) => {
    if (!selectedTable || !confirm('Delete this item?')) return;

    // Queue the delete instead of executing immediately
    setPendingDeletes(prev => new Set(prev).add(itemId));
    setHasUnsavedChanges(true);
  };

  const handleBatchCreateItems = (newItems: YarnItemCreate[]) => {
    if (!selectedTable) return;

    // Queue the batch create instead of executing immediately
    setPendingCreates(prev => [...prev, ...newItems]);
    setHasUnsavedChanges(true);
  };

  const handleReorderItems = (reorderedItems: { id: number; display_order: number }[]) => {
    if (!selectedTable) return;

    // Store pending reorder, don't save yet
    setPendingItemReorder(reorderedItems);
    setHasUnsavedChanges(true);
  };

  const handleReorderTables = (reorderedTables: { id: number; display_order: number }[]) => {
    // Store pending reorder, don't save yet
    setPendingTableReorder(reorderedTables);
    setHasUnsavedChanges(true);
  };

  const handleEditTable = (table: TableGroup) => {
    setEditingTable(table);
    setShowEditTableDialog(true);
  };

  const handleSaveTable = async (formData: { table_name: string; show_on_homepage: boolean }) => {
    if (!editingTable) return;

    // Queue table changes instead of saving immediately
    setPendingTableUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(editingTable.id, formData);
      return newMap;
    });
    setHasUnsavedChanges(true);
    setShowEditTableDialog(false);
    setEditingTable(null);
  };

  const handleDeleteTable = async () => {
    if (!editingTable || !confirm('Delete this table group? All items will be deleted.')) return;

    deleteTableMutation.mutate(editingTable.id, {
      onSuccess: () => {
        setShowEditTableDialog(false);
        setEditingTable(null);
        if (selectedTable === editingTable.id) {
          setSelectedTable(null);
        }
      },
      onError: (error) => {
        alert(error.message);
      },
    });
  };

  const handleSaveAndBroadcast = async () => {
    if (!selectedTable) return;

    const savePromises = [];

    // Execute all pending table updates first
    for (const [tableId, updates] of pendingTableUpdates) {
      savePromises.push(
        new Promise<void>((resolve, reject) => {
          updateTableMutation.mutate(
            { id: tableId, updates },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        })
      );
    }

    // Execute all pending deletes
    for (const itemId of pendingDeletes) {
      savePromises.push(
        new Promise<void>((resolve, reject) => {
          deleteItemMutation.mutate(
            { itemId, tableGroupId: selectedTable },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        })
      );
    }

    // Execute all pending updates
    for (const [itemId, updates] of pendingUpdates) {
      savePromises.push(
        new Promise<void>((resolve, reject) => {
          updateItemMutation.mutate(
            { itemId, updates, tableGroupId: selectedTable },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        })
      );
    }

    // Execute all pending creates
    if (pendingCreates.length > 0) {
      savePromises.push(
        new Promise<void>((resolve, reject) => {
          batchCreateItemsMutation.mutate(
            { tableGroupId: selectedTable, items: pendingCreates },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        })
      );
    }

    // Execute pending item reorder
    if (pendingItemReorder) {
      savePromises.push(
        new Promise<void>((resolve, reject) => {
          reorderItemsMutation.mutate(
            { tableGroupId: selectedTable, items: pendingItemReorder },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        })
      );
    }

    // Execute pending table reorder
    if (pendingTableReorder) {
      savePromises.push(
        new Promise<void>((resolve, reject) => {
          reorderTablesMutation.mutate(pendingTableReorder, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
        })
      );
    }

    // Wait for all saves to complete
    if (savePromises.length > 0) {
      try {
        await Promise.all(savePromises);

        // Clear all pending operations
        setPendingTableUpdates(new Map());
        setPendingDeletes(new Set());
        setPendingUpdates(new Map());
        setPendingCreates([]);
        setPendingItemReorder(null);
        setPendingTableReorder(null);
      } catch (error: unknown) {
        const err = error as Error;
        alert(err.message || 'Failed to save changes');
        return;
      }
    }

    // Then show broadcast dialog
    setShowBroadcastDialog(true);
  };

  const handleSendBroadcast = async () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group');
      return;
    }
    if (!selectedTable) return;

    sendBroadcastMutation.mutate(
      {
        group_ids: selectedGroups,
        message_type: 'auto_generate',
        table_group_ids: [selectedTable],
        send_immediately: true,
      },
      {
        onSuccess: () => {
          alert('Broadcast sent successfully!');
          setShowBroadcastDialog(false);
          setSelectedGroups([]);
          setHasUnsavedChanges(false);
        },
        onError: (error) => {
          alert(error.message);
        },
      }
    );
  };

  const selectedTableData = tableGroups.find(t => t.id === selectedTable);

  const handleToggleGroup = (groupId: number) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  if (!mounted || loadingTables) {
    return <LoadingSpinner message="Loading inventory..." />;
  }

  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Inventory Management
        </h1>
        <p className="text-blue-600 mt-1 font-medium text-sm md:text-base">
          Manage table groups and yarn items - Excel-like inline editing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <TableGroupSidebar
            tableGroups={tableGroups}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            onEditTable={handleEditTable}
            isCreating={createTableMutation.isPending}
            onCreateTable={(name: string) => {
              createTableMutation.mutate({
                table_name: name,
                display_order: tableGroups.length,
                show_on_homepage: true,
              });
            }}
            onReorderTables={handleReorderTables}
          />
        </div>

        <div className="lg:col-span-3">
          {!selectedTable ? (
            <Card className="p-8 md:p-16 text-center border-2 border-blue-100">
              <div className="text-6xl md:text-8xl mb-6 text-blue-200">📋</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No Table Selected</h3>
              <p className="text-gray-600 text-base md:text-lg">Select a table group from the sidebar</p>
            </Card>
          ) : loadingItems ? (
            <Card className="flex items-center justify-center py-32 border-2 border-blue-100">
              <LoadingSpinner message="Loading items..." />
            </Card>
          ) : (
            <Card className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {selectedTableData?.table_name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Edit items directly in the table. Click &quot;Save & Broadcast&quot; when ready to notify customers.
                  </p>
                </div>
                {hasUnsavedChanges && (
                  <button
                    onClick={handleSaveAndBroadcast}
                    className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    title="Save & Broadcast"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                )}
              </div>

              <EditableItemsTable
                items={items}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onCreateItem={handleCreateItem}
                onBatchCreate={handleBatchCreateItems}
                onReorder={handleReorderItems}
                isCreating={createItemMutation.isPending || batchCreateItemsMutation.isPending}
                isDeleting={deleteItemMutation.isPending}
              />
            </Card>
          )}
        </div>
      </div>

      <TableEditDialog
        table={editingTable}
        open={showEditTableDialog}
        onOpenChange={(open) => {
          setShowEditTableDialog(open);
          if (!open) setEditingTable(null);
        }}
        onSave={handleSaveTable}
        onDelete={handleDeleteTable}
        isSaving={updateTableMutation.isPending}
        isDeleting={deleteTableMutation.isPending}
      />

      <BroadcastDialog
        open={showBroadcastDialog}
        onOpenChange={(open) => {
          setShowBroadcastDialog(open);
          if (!open) setSelectedGroups([]);
        }}
        groups={whatsappGroups}
        selectedGroups={selectedGroups}
        onToggleGroup={handleToggleGroup}
        onSend={handleSendBroadcast}
        isSending={sendBroadcastMutation.isPending}
      />
    </div>
  );
}
