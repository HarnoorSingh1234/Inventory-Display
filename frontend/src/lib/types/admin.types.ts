// Table Group Types
export interface TableGroup {
  id: number;
  table_name: string;
  display_order: number;
  show_on_homepage: boolean;
  item_count: number;
  created_at: string;
  updated_at?: string;
}

export interface TableGroupCreate {
  table_name: string;
  display_order: number;
  show_on_homepage: boolean;
}

export interface TableGroupUpdate {
  table_name?: string;
  display_order?: number;
  show_on_homepage?: boolean;
}

// Yarn Item Types
export interface YarnItem {
  id: number;
  serial_number: number;
  count: string;
  quality: string;
  rate: number;
  display_order: number;
  show_on_homepage: boolean;
  created_at: string;
  updated_at?: string;
}

export interface YarnItemCreate {
  count: string;
  quality: string;
  rate: number;
  display_order: number;
  show_on_homepage: boolean;
}

export interface YarnItemUpdate {
  count?: string;
  quality?: string;
  rate?: number;
  display_order?: number;
  show_on_homepage?: boolean;
}

export interface TableGroupItemsResponse {
  items: YarnItem[];
}

// WhatsApp Group Types
export interface WhatsAppGroup {
  id: number;
  group_name: string;
  jid: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WhatsAppGroupCreate {
  group_name: string;
  jid: string;
  is_active?: boolean;
}

export interface WhatsAppGroupUpdate {
  group_name?: string;
  jid?: string;
  is_active?: boolean;
}

// Broadcast Types
export interface BroadcastRequest {
  group_ids: number[];
  message_type: 'auto_generate' | 'custom';
  table_group_ids?: number[];
  custom_message?: string;
  send_immediately: boolean;
  scheduled_time?: string;
}

export interface BroadcastResponse {
  id: number;
  status: string;
  message: string;
  sent_at?: string;
}

// Admin User Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
}
