import { useState } from 'react';
import { WhatsAppGroup, WhatsAppGroupUpdate } from '@/types/whatsapp';
import { useApiClient } from '@/lib/api/axios';

interface WhatsAppGroupCardProps {
  group: WhatsAppGroup;
  onUpdate: () => void;
}

export default function WhatsAppGroupCard({ group, onUpdate }: WhatsAppGroupCardProps) {
  const { callApi } = useApiClient();
  const [editing, setEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.group_name);
  const [isActive, setIsActive] = useState(group.is_active);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: WhatsAppGroupUpdate = {
        group_name: groupName,
        is_active: isActive,
      };

      await callApi(`/admin/whatsapp/groups/${group.id}`, {
        method: 'PUT',
        body: updateData as unknown as Record<string, unknown>,
      });
      setEditing(false);
      onUpdate();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this WhatsApp group?')) return;

    setDeleting(true);
    try {
      await callApi(`/admin/whatsapp/groups/${group.id}`, {
        method: 'DELETE',
      });
      onUpdate();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setGroupName(group.group_name);
    setIsActive(group.is_active);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <div className="space-y-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{group.group_name}</h3>
        <span className={`px-2 py-1 text-xs rounded ${
          group.is_active 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {group.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Invite ID: {group.group_invite_id}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
