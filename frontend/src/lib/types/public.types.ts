// Public-facing types for homepage

export interface YarnItemPublic {
  id: number;
  serial_number: number;
  count: string;
  quality: string;
  rate: number;
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
