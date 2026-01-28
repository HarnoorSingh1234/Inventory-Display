import { TableGroup } from '@/types/table';

interface TableGroupCardProps {
  tableGroup: TableGroup;
  selected: boolean;
  onClick: () => void;
  onRefresh: () => void;
}

export default function TableGroupCard({ 
  tableGroup, 
  selected, 
  onClick 
}: TableGroupCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
        selected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform scale-[1.02]'
          : 'border-blue-200 hover:border-blue-300 bg-white hover:bg-blue-50/50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold text-base ${
          selected ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {tableGroup.table_name}
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          tableGroup.show_on_homepage 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {tableGroup.show_on_homepage ? '👁️ Visible' : '🚫 Hidden'}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${
          selected ? 'text-blue-700' : 'text-gray-600'
        }`}>
          📦 {tableGroup.item_count} items
        </span>
        <span className={`text-xs px-2 py-1 rounded-lg ${
          selected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'
        }`}>
          #{tableGroup.display_order}
        </span>
      </div>
    </div>
  );
}
