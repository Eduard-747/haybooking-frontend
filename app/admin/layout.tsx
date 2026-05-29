import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${inter.className}`}>
      {/* Super Admin Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center font-bold">
            S
          </div>
          <h1 className="text-xl font-bold tracking-wide">HayBooking <span className="font-light text-slate-300">Super Admin</span></h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
