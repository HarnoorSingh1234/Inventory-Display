export interface BroadcastRequest {
  group_ids: number[];
  message_type: 'auto_generate' | 'custom';
  table_group_ids?: number[];
  custom_message?: string;
  send_immediately: boolean;
  scheduled_hour?: number;
  scheduled_minute?: number;
}

export interface BroadcastResult {
  history_id?: number;
  group_id: number;
  group_name: string;
  status: string;
  scheduled_time?: string;
  error?: string;
}

export interface BroadcastResponse {
  message: string;
  results: BroadcastResult[];
}

export interface BroadcastHistory {
  id: number;
  group_id: number;
  group_name: string;
  message_preview: string;
  message_type: string;
  table_groups?: string[];
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'scheduled' | 'sent' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface BroadcastHistoryList {
  history: BroadcastHistory[];
  total_count: number;
}
