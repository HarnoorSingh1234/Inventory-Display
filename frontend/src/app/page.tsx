'use client';

import { useEffect, useState } from 'react';
import { HomepageData, TableGroupWithItems } from '@/types/table';
import InventoryTable from '@/components/public/InventoryTable';
import SearchBar from '@/components/public/SearchBar';
import Header from '@/components/public/Header';
import { formatDate } from '@/lib/utils';

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE_URL}/homepage/tables`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const responseData: HomepageData = await response.json();
      if (responseData && responseData.tables) {
        setData(responseData);
      } else {
        setData({ tables: [], last_updated: new Date().toISOString() });
      }
    } catch (err) {
      setError('Failed to load inventory. Please try again later.');
      console.error('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTables = (tables: TableGroupWithItems[]): TableGroupWithItems[] => {
    if (!searchQuery.trim()) return tables;

    const query = searchQuery.toLowerCase();
    return tables
      .map(table => ({
        ...table,
        items: table.items.filter(item =>
          item.count.toLowerCase().includes(query) ||
          item.quality.toLowerCase().includes(query)
        )
      }))
      .filter(table => table.items.length > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-700 font-medium text-lg">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Error Loading Data</h2>
          <p className="text-gray-600 mb-6 text-lg">{error}</p>
          <button
            onClick={fetchData}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredTables = data ? filterTables(data.tables) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-10 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text mb-3">
            <h1 className="text-5xl font-extrabold">
              Polyester Yarn - Live Rates
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">
              Updated: {data?.last_updated ? formatDate(data.last_updated) : 'N/A'}
            </p>
          </div>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="space-y-8 mt-10">
          {filteredTables.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-blue-100">
              <div className="text-blue-200 text-6xl mb-6">🔍</div>
              <p className="text-gray-700 text-xl font-medium">
                {searchQuery ? `No items found matching "${searchQuery}"` : 'No inventory available'}
              </p>
            </div>
          ) : (
            filteredTables.map(table => (
              <InventoryTable key={table.id} table={table} />
            ))
          )}
        </div>
      </main>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full p-5 shadow-2xl transition-all hover:scale-110 z-50 group"
        aria-label="Contact us on WhatsApp"
      >
        <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
