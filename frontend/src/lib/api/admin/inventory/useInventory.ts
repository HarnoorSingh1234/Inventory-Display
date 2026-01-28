'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { getToken } from '@/lib/auth';
import type {
  TableGroup,
  TableGroupCreate,
  TableGroupUpdate,
  YarnItem,
  YarnItemCreate,
  YarnItemUpdate,
} from '@/lib/types/admin.types';
import {
  fetchTableGroups,
  createTableGroup,
  updateTableGroup,
  deleteTableGroup,
  fetchYarnItems,
  createYarnItem,
  updateYarnItem,
  deleteYarnItem,
  batchCreateYarnItems,
  reorderYarnItems,
  reorderTableGroups,
} from './inventory.api';

// Query keys for cache management
export const inventoryKeys = {
  all: ['inventory'] as const,
  tableGroups: () => [...inventoryKeys.all, 'table-groups'] as const,
  tableGroup: (id: number) => [...inventoryKeys.all, 'table-group', id] as const,
  yarnItems: (tableGroupId: number) => [...inventoryKeys.all, 'yarn-items', tableGroupId] as const,
  yarnItem: (id: number) => [...inventoryKeys.all, 'yarn-item', id] as const,
};

// ========== Table Groups Hooks ==========

export function useTableGroups(): UseQueryResult<TableGroup[], Error> {
  const token = getToken();

  return useQuery({
    queryKey: inventoryKeys.tableGroups(),
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchTableGroups(token);
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

export function useCreateTableGroup() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (tableGroup: TableGroupCreate) => {
      if (!token) throw new Error('No authentication token');
      return createTableGroup(token, tableGroup);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroups() });
    },
  });
}

export function useUpdateTableGroup() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: TableGroupUpdate }) => {
      if (!token) throw new Error('No authentication token');
      return updateTableGroup(token, id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroups() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroup(variables.id) });
    },
  });
}

export function useDeleteTableGroup() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No authentication token');
      return deleteTableGroup(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroups() });
    },
  });
}

// ========== Yarn Items Hooks ==========

export function useYarnItems(tableGroupId: number | null): UseQueryResult<YarnItem[], Error> {
  const token = getToken();

  return useQuery({
    queryKey: tableGroupId ? inventoryKeys.yarnItems(tableGroupId) : ['yarn-items-null'],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      if (!tableGroupId) throw new Error('No table group ID provided');
      return fetchYarnItems(token, tableGroupId);
    },
    enabled: !!token && !!tableGroupId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

export function useCreateYarnItem() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: ({ tableGroupId, item }: { tableGroupId: number; item: YarnItemCreate }) => {
      if (!token) throw new Error('No authentication token');
      return createYarnItem(token, tableGroupId, item);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.yarnItems(variables.tableGroupId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroups() });
    },
  });
}

export function useUpdateYarnItem() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: number; updates: YarnItemUpdate; tableGroupId: number }) => {
      if (!token) throw new Error('No authentication token');
      return updateYarnItem(token, itemId, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.yarnItems(variables.tableGroupId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.yarnItem(variables.itemId) });
    },
  });
}

export function useDeleteYarnItem() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: ({ itemId }: { itemId: number; tableGroupId: number }) => {
      if (!token) throw new Error('No authentication token');
      return deleteYarnItem(token, itemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.yarnItems(variables.tableGroupId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroups() });
    },
  });
}

// ========== Batch & Reorder Hooks ==========

export function useBatchCreateYarnItems() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: ({ tableGroupId, items }: { tableGroupId: number; items: YarnItemCreate[] }) => {
      if (!token) throw new Error('No authentication token');
      return batchCreateYarnItems(token, tableGroupId, items);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.yarnItems(variables.tableGroupId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroups() });
    },
  });
}

export function useReorderYarnItems() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: ({ tableGroupId, items }: { tableGroupId: number; items: { id: number; display_order: number }[] }) => {
      if (!token) throw new Error('No authentication token');
      return reorderYarnItems(token, tableGroupId, items);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.yarnItems(variables.tableGroupId) });
    },
  });
}

export function useReorderTableGroups() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (tables: { id: number; display_order: number }[]) => {
      if (!token) throw new Error('No authentication token');
      return reorderTableGroups(token, tables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.tableGroups() });
    },
  });
}
