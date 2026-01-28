import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md border-b-2 border-blue-100">
      <div className="container mx-auto px-4 py-5 flex justify-between items-center max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold">HS</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">HS Traders</h1>
            <p className="text-sm text-blue-600 font-medium">Premium Polyester Yarn Supplier</p>
          </div>
        </div>
        
        <Link
          href="/admin/login"
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all border border-blue-200 hover:border-blue-300"
        >
          Admin Login
        </Link>
      </div>
    </header>
  );
}
