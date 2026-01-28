'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApiClient } from '@/lib/api/axios';
import { WhatsAppGroup } from '@/types/whatsapp';
import { TableGroup } from '@/types/table';
import { BroadcastHistory, BroadcastRequest } from '@/types/broadcast';
import { formatDate, truncate } from '@/lib/utils';

export default function BroadcastPage() {
  const { callApi } = useApiClient();
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [tables, setTables] = useState<TableGroup[]>([]);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [messageType, setMessageType] = useState<'auto_generate' | 'custom'>('auto_generate');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [fetchedGroups, fetchedTables, historyRes] = await Promise.all([
        callApi<WhatsAppGroup[]>('/admin/whatsapp/groups'),
        callApi<TableGroup[]>('/admin/table-groups'),
        callApi<{ history: BroadcastHistory[]; total: number; limit: number; offset: number }>('/admin/broadcast/history?limit=10')
      ]);

      setGroups((fetchedGroups || []).filter((g: WhatsAppGroup) => g.is_active));
      setTables(fetchedTables || []);
      setHistory(historyRes.history || []);
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to load data');
      // Ensure arrays are set even on error
      setGroups([]);
      setTables([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group');
      return;
    }

    if (messageType === 'auto_generate' && selectedTables.length === 0) {
      alert('Please select at least one table for auto-generated message');
      return;
    }

    if (messageType === 'custom' && !customMessage.trim()) {
      alert('Please enter a custom message');
      return;
    }

    setSending(true);

    try {
      const requestData: BroadcastRequest = {
        group_ids: selectedGroups,
        message_type: messageType,
        table_group_ids: messageType === 'auto_generate' ? selectedTables : undefined,
        custom_message: messageType === 'custom' ? customMessage : undefined,
        send_immediately: true,
      };

      const response = await callApi<{ message: string }>('/admin/broadcast', {
        method: 'POST',
        body: requestData as unknown as Record<string, unknown>
      });
      alert(response.message || 'Broadcast sent successfully!');
      
      // Reset form
      setSelectedGroups([]);
      setSelectedTables([]);
      setCustomMessage('');
      
      // Refresh history
      fetchData();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading broadcast panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Broadcast Messages</h1>
        <p className="text-gray-600 mt-1">Send messages to WhatsApp groups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Send Broadcast</h2>

          {/* Group Selection */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-900">
              Select Groups <span className="text-red-500">*</span>
            </label>
            {groups.length === 0 ? (
              <p className="text-gray-500 text-sm">No active groups available. Add groups first.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {groups.map(group => (
                  <label key={group.id} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroups([...selectedGroups, group.id]);
                        } else {
                          setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{group.group_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Message Type */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-900">Message Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={messageType === 'auto_generate'}
                  onChange={() => setMessageType('auto_generate')}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-medium">Auto-generate from inventory</span>
                  <p className="text-xs text-gray-600">System will generate message from selected tables</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={messageType === 'custom'}
                  onChange={() => setMessageType('custom')}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-medium">Custom message</span>
                  <p className="text-xs text-gray-600">Write your own message</p>
                </div>
              </label>
            </div>
          </div>

          {/* Table Selection or Custom Message */}
          {messageType === 'auto_generate' ? (
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-gray-900">
                Select Tables <span className="text-red-500">*</span>
              </label>
              {tables.length === 0 ? (
                <p className="text-gray-500 text-sm">No tables available. Create tables first.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                  {tables.map(table => (
                    <label key={table.id} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTables([...selectedTables, table.id]);
                          } else {
                            setSelectedTables(selectedTables.filter(id => id !== table.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{table.table_name}</span>
                      <span className="text-xs text-gray-500">({table.item_count} items)</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-gray-900">
                Custom Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter your message here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {customMessage.length} characters
              </p>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || selectedGroups.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {sending ? 'Sending Broadcast...' : 'Send Broadcast'}
          </button>
        </div>

        {/* History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Broadcast History</h2>

          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">📢</p>
                <p>No broadcast history yet</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">{item.group_name}</span>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {truncate(item.message_preview, 100)}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Type: {item.message_type === 'auto_generate' ? 'Auto-generated' : 'Custom'}</p>
                    {item.table_groups && item.table_groups.length > 0 && (
                      <p>Tables: {item.table_groups.join(', ')}</p>
                    )}
                    <p>Scheduled: {formatDate(item.scheduled_for)}</p>
                    {item.sent_at && <p>Sent: {formatDate(item.sent_at)}</p>}
                    {item.error_message && (
                      <p className="text-red-600 font-medium">Error: {item.error_message}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
