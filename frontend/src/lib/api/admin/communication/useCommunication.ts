'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { getToken } from '@/lib/auth';
import type {
  WhatsAppGroup,
  WhatsAppGroupCreate,
  WhatsAppGroupUpdate,
  BroadcastRequest,
  BroadcastResponse,
} from '@/lib/types/admin.types';
import {
  fetchWhatsAppGroups,
  createWhatsAppGroup,
  updateWhatsAppGroup,
  deleteWhatsAppGroup,
  sendBroadcast,
} from './communication.api';

// Query keys
export const communicationKeys = {
  all: ['communication'] as const,
  whatsappGroups: () => [...communicationKeys.all, 'whatsapp-groups'] as const,
  whatsappGroup: (id: number) => [...communicationKeys.all, 'whatsapp-group', id] as const,
};

// ========== WhatsApp Groups Hooks ==========

export function useWhatsAppGroups(): UseQueryResult<WhatsAppGroup[], Error> {
  const token = getToken();

  return useQuery({
    queryKey: communicationKeys.whatsappGroups(),
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchWhatsAppGroups(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateWhatsAppGroup() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (group: WhatsAppGroupCreate) => {
      if (!token) throw new Error('No authentication token');
      return createWhatsAppGroup(token, group);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.whatsappGroups() });
    },
  });
}

export function useUpdateWhatsAppGroup() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: WhatsAppGroupUpdate }) => {
      if (!token) throw new Error('No authentication token');
      return updateWhatsAppGroup(token, id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.whatsappGroups() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.whatsappGroup(variables.id) });
    },
  });
}

export function useDeleteWhatsAppGroup() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No authentication token');
      return deleteWhatsAppGroup(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.whatsappGroups() });
    },
  });
}

// ========== Broadcast Hooks ==========

export function useSendBroadcast() {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation({
    mutationFn: (request: BroadcastRequest) => {
      if (!token) throw new Error('No authentication token');
      return sendBroadcast(token, request);
    },
    onSuccess: () => {
      // Optionally invalidate broadcast history if you have that
      console.log('Broadcast sent successfully');
    },
  });
}
