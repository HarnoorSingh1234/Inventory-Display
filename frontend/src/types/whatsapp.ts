export interface WhatsAppGroup {
  id: number;
  group_name: string;
  group_invite_id: string;
  is_active: boolean;
  created_at: string;
}

export interface WhatsAppGroupCreate {
  group_name: string;
  group_invite_link: string;
  is_active: boolean;
}

export interface WhatsAppGroupUpdate {
  group_name?: string;
  group_invite_link?: string;
  is_active?: boolean;
}

export interface WhatsAppGroupList {
  groups: WhatsAppGroup[];
  total_count: number;
}
