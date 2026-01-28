import axios from 'axios';
import type {
  TableGroup,
  TableGroupCreate,
  TableGroupUpdate,
  YarnItem,
  YarnItemCreate,
  YarnItemUpdate,
  TableGroupItemsResponse,
} from '@/lib/types/admin.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Helper to build error messages
const buildError = (action: string, error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message;
    return new Error(`Failed to ${action}: ${message}`);
  }
  return error instanceof Error ? error : new Error(`Failed to ${action}`);
};

// ========== Table Groups API ==========

export async function fetchTableGroups(accessToken: string): Promise<TableGroup[]> {
  try {
    const { data } = await adminApi.get<TableGroup[]>('/admin/table-groups', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('fetch table groups', error);
  }
}

export async function createTableGroup(
  accessToken: string,
  tableGroup: TableGroupCreate
): Promise<TableGroup> {
  try {
    const { data } = await adminApi.post<TableGroup>('/admin/table-groups', tableGroup, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('create table group', error);
  }
}

export async function updateTableGroup(
  accessToken: string,
  id: number,
  updates: TableGroupUpdate
): Promise<TableGroup> {
  try {
    const { data } = await adminApi.put<TableGroup>(`/admin/table-groups/${id}`, updates, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('update table group', error);
  }
}

export async function deleteTableGroup(accessToken: string, id: number): Promise<void> {
  try {
    await adminApi.delete(`/admin/table-groups/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw buildError('delete table group', error);
  }
}

// ========== Yarn Items API ==========

export async function fetchYarnItems(
  accessToken: string,
  tableGroupId: number
): Promise<YarnItem[]> {
  try {
    const { data } = await adminApi.get<TableGroupItemsResponse>(
      `/admin/table-groups/${tableGroupId}/items`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return data.items || [];
  } catch (error) {
    throw buildError('fetch yarn items', error);
  }
}

export async function createYarnItem(
  accessToken: string,
  tableGroupId: number,
  item: YarnItemCreate
): Promise<YarnItem> {
  try {
    const { data } = await adminApi.post<YarnItem>(
      `/admin/table-groups/${tableGroupId}/items`,
      item,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return data;
  } catch (error) {
    throw buildError('create yarn item', error);
  }
}

export async function updateYarnItem(
  accessToken: string,
  itemId: number,
  updates: YarnItemUpdate
): Promise<YarnItem> {
  try {
    const { data } = await adminApi.put<YarnItem>(`/admin/yarn-items/${itemId}`, updates, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('update yarn item', error);
  }
}

export async function deleteYarnItem(accessToken: string, itemId: number): Promise<void> {
  try {
    await adminApi.delete(`/admin/yarn-items/${itemId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw buildError('delete yarn item', error);
  }
}

// ========== Batch Operations ==========

export async function batchCreateYarnItems(
  accessToken: string,
  tableGroupId: number,
  items: YarnItemCreate[]
): Promise<YarnItem[]> {
  try {
    const { data } = await adminApi.post<YarnItem[]>(
      `/admin/table-groups/${tableGroupId}/items/batch`,
      { items },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return data;
  } catch (error) {
    throw buildError('batch create yarn items', error);
  }
}

export async function reorderYarnItems(
  accessToken: string,
  tableGroupId: number,
  reorderData: { id: number; display_order: number }[]
): Promise<void> {
  try {
    await adminApi.put(
      `/admin/table-groups/${tableGroupId}/items/reorder`,
      { items: reorderData },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {
    throw buildError('reorder yarn items', error);
  }
}

export async function reorderTableGroups(
  accessToken: string,
  reorderData: { id: number; display_order: number }[]
): Promise<void> {
  try {
    await adminApi.put(
      '/admin/table-groups/reorder',
      { tables: reorderData },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {
    throw buildError('reorder table groups', error);
  }
}
