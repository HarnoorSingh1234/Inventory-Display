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

export interface YarnItemPublic {
  id: number;
  serial_number: number;
  count: string;
  quality: string;
  rate: number;
}

export interface TableGroup {
  id: number;
  table_name: string;
  display_order: number;
  show_on_homepage: boolean;
  item_count: number;
  created_at: string;
  updated_at?: string;
}

export interface TableGroupWithItems {
  id: number;
  table_name: string;
  display_order: number;
  items: YarnItemPublic[];
}

export interface HomepageData {
  tables: TableGroupWithItems[];
  last_updated: string;
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
