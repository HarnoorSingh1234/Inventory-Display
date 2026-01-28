import axios from 'axios';
import type {
  WhatsAppGroup,
  WhatsAppGroupCreate,
  WhatsAppGroupUpdate,
  BroadcastRequest,
  BroadcastResponse,
} from '@/lib/types/admin.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const buildError = (action: string, error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message;
    return new Error(`Failed to ${action}: ${message}`);
  }
  return error instanceof Error ? error : new Error(`Failed to ${action}`);
};

// ========== WhatsApp Groups API ==========

export async function fetchWhatsAppGroups(accessToken: string): Promise<WhatsAppGroup[]> {
  try {
    const { data } = await adminApi.get<WhatsAppGroup[]>('/admin/whatsapp/groups', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('fetch WhatsApp groups', error);
  }
}

export async function createWhatsAppGroup(
  accessToken: string,
  group: WhatsAppGroupCreate
): Promise<WhatsAppGroup> {
  try {
    const { data } = await adminApi.post<WhatsAppGroup>('/admin/whatsapp/groups', group, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('create WhatsApp group', error);
  }
}

export async function updateWhatsAppGroup(
  accessToken: string,
  id: number,
  updates: WhatsAppGroupUpdate
): Promise<WhatsAppGroup> {
  try {
    const { data } = await adminApi.put<WhatsAppGroup>(`/admin/whatsapp/groups/${id}`, updates, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('update WhatsApp group', error);
  }
}

export async function deleteWhatsAppGroup(accessToken: string, id: number): Promise<void> {
  try {
    await adminApi.delete(`/admin/whatsapp/groups/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw buildError('delete WhatsApp group', error);
  }
}

// ========== Broadcast API ==========

export async function sendBroadcast(
  accessToken: string,
  request: BroadcastRequest
): Promise<BroadcastResponse> {
  try {
    const { data } = await adminApi.post<BroadcastResponse>('/admin/broadcast', request, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    throw buildError('send broadcast', error);
  }
}
