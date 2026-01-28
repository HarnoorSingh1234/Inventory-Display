'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { href: '/admin/whatsapp', label: 'WhatsApp Groups', icon: '💬' },
    { href: '/admin/broadcast', label: 'Broadcast', icon: '📢' },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-white shadow-2xl flex flex-col border-r-2 border-blue-100 transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-8 bg-white border-2 border-blue-200 rounded-full p-2 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg 
          className={`w-4 h-4 text-blue-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={`p-6 border-b-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white ${collapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center gap-3 mb-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white text-xl font-bold">HS</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Admin Panel</h2>
              <p className="text-sm text-blue-600 font-medium">HS Traders</p>
            </div>
          )}
        </div>
      </div>

      <nav className="p-4 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 mb-2 rounded-xl transition-all font-medium ${
              collapsed ? 'justify-center' : ''
            } ${
              pathname === item.href
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-2 border-transparent hover:border-blue-100'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="text-2xl">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className={`p-4 border-t-2 border-blue-100 ${collapsed ? 'px-3' : ''}`}>
        <button
          onClick={logout}
          className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${collapsed ? 'px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
