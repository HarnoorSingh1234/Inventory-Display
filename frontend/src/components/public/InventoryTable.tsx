import { TableGroupWithItems } from '@/types/table';
import { formatCurrency } from '@/lib/utils';

interface InventoryTableProps {
  table: TableGroupWithItems;
}

export default function InventoryTable({ table }: InventoryTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-white rounded-full"></span>
          {table.table_name}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50 border-b-2 border-blue-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">S.No</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Count</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Quality</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Rate (₹/kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {table.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl text-blue-200">📦</div>
                    <p className="text-blue-600 font-medium">No items available in this table</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-all group">
                  <td className="px-6 py-4 text-sm text-blue-900 font-medium">{item.serial_number}</td>
                  <td className="px-6 py-4 text-base font-semibold text-gray-900">{item.count}</td>
                  <td className="px-6 py-4 text-base text-gray-700">{item.quality}</td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-blue-600 group-hover:text-blue-700">
                      {formatCurrency(item.rate)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
