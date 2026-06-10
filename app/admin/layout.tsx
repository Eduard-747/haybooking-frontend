import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${inter.className}`}>
      {/* Super Admin Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 flex items-center justify-center font-bold text-sm sm:text-base">
            S
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-wide">HayBooking <span className="font-light text-slate-300">Admin</span></h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
