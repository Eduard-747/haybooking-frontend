"use client"

import { Search, Bell, User, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ClientTopHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      router.push(`/client/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white border-b border-border/40 h-16 flex items-center px-4 sm:px-6 sticky top-0 z-40">
      
      {/* Middle: Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search services or businesses... (Press Enter)" 
          className="w-full h-10 pl-10 pr-4 bg-[#FAFAFA] border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#C69C9B]/50"
        />
      </div>

      {/* Right: Actions */}
      <div className="ml-auto flex items-center gap-4 pl-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors p-2 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#E5555E] rounded-full"></span>
        </button>

        <button 
          onClick={() => { logout(); router.push('/auth'); }}
          className="text-muted-foreground hover:text-red-500 transition-colors p-2 md:hidden"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
        
        <Avatar 
          className="h-9 w-9 border border-border cursor-pointer bg-[#FDF6F6] hover:ring-2 hover:ring-[#C69C9B]/50 transition-all"
          onClick={() => router.push('/client/settings')}
        >
          <AvatarFallback className="bg-[#FDF6F6]">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : <User className="h-4 w-4 text-[#C69C9B]" />}
          </AvatarFallback>
          {user && (user.image || user.name) && (
            <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.name || '') + ' ' + (user.surname || ''))}&background=FDF6F6&color=C69C9B&size=100`} />
          )}
        </Avatar>
      </div>
      
    </header>
  )
}
