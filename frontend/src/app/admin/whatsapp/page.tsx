'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApiClient } from '@/lib/api/axios';
import { WhatsAppGroup, WhatsAppGroupCreate } from '@/types/whatsapp';
import WhatsAppGroupCard from '@/components/admin/WhatsAppGroupCard';
import { extractInviteId } from '@/lib/utils';

export default function WhatsAppPage() {
  const { callApi } = useApiClient();
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [formData, setFormData] = useState({
    group_name: '',
    group_invite_link: '',
    is_active: true,
  });
  const [creating, setCreating] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const groups = await callApi<WhatsAppGroup[]>('/admin/whatsapp/groups');
      setGroups(groups || []);
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to load WhatsApp groups');
      setGroups([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.group_name.trim() || !formData.group_invite_link.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const inviteId = extractInviteId(formData.group_invite_link);
    if (!inviteId) {
      alert('Invalid WhatsApp group invite link. Please use a valid link like: https://chat.whatsapp.com/ABC123');
      return;
    }

    setCreating(true);
    try {
      const createData: WhatsAppGroupCreate = {
        group_name: formData.group_name,
        group_invite_link: formData.group_invite_link,
        is_active: formData.is_active,
      };

      await callApi('/admin/whatsapp/groups', {
        method: 'POST',
        body: createData as unknown as Record<string, unknown>
      });
      setFormData({ group_name: '', group_invite_link: '', is_active: true });
      setShowNewGroupForm(false);
      fetchGroups();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WhatsApp groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Groups</h1>
        <p className="text-gray-600 mt-1">Manage WhatsApp groups for broadcasting messages</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow max-w-4xl">
        {!showNewGroupForm ? (
          <button
            onClick={() => setShowNewGroupForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium mb-6"
          >
            + Add WhatsApp Group
          </button>
        ) : (
          <form onSubmit={handleCreateGroup} className="mb-6 p-6 bg-green-50 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New WhatsApp Group</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  placeholder="e.g., VIP Customers"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Invite Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.group_invite_link}
                  onChange={(e) => setFormData({ ...formData, group_invite_link: e.target.value })}
                  placeholder="https://chat.whatsapp.com/ABC123..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get the invite link from WhatsApp: Group Info → Invite via link
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Active (can receive broadcasts)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={creating}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewGroupForm(false);
                  setFormData({ group_name: '', group_invite_link: '', is_active: true });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">💬</p>
              <p>No WhatsApp groups yet. Add your first group!</p>
            </div>
          ) : (
            groups.map(group => (
              <WhatsAppGroupCard
                key={group.id}
                group={group}
                onUpdate={fetchGroups}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
