"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, FolderOpen, LogOut, Loader2, DollarSign } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'owner' | 'sales' | 'developer' | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role) {
        setRole(profile.role as any)
      } else {
        // Fallback for mock environment
        setRole(pathname.includes('/owner') ? 'owner' : 'sales')
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-offwhite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    )
  }

  const navLinks = role === 'owner' ? [
    { name: 'Overview', href: '/dashboard/owner', icon: LayoutDashboard },
    { name: 'Clients', href: '/dashboard/owner/clients', icon: Users },
    { name: 'Projects', href: '/dashboard/owner/projects', icon: FolderOpen },
    { name: 'Staff', href: '/dashboard/owner/employees', icon: Users },
    { name: 'Revenue', href: '/dashboard/owner/revenue', icon: DollarSign },
    { name: 'Employee View', href: '/dashboard/employee', icon: LayoutDashboard },
  ] : [
    { name: 'My Dashboard', href: '/dashboard/employee', icon: LayoutDashboard },
    { name: 'Clients/Leads', href: '/dashboard/employee/clients', icon: Users },
    { name: 'Projects', href: '/dashboard/employee/projects', icon: FolderOpen },
    { name: 'Payment Info', href: '/dashboard/employee/settings', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-brand-offwhite flex font-sans">
      {/* Sidebar - Editorial Dark */}
      <aside className="w-72 bg-brand-charcoal text-brand-offwhite flex flex-col hidden md:flex border-r border-white/5">
        <div className="p-10 border-b border-white/10">
          <Link href="/" className="flex flex-col gap-4 group">
            <Image 
              src="/logo-icon.png" 
              alt="Kal Studio" 
              width={40} height={40} 
              className="w-10 h-10 object-contain brightness-0 invert" 
            />
            <div>
              <h2 className="text-xl font-bold tracking-tighter text-white">Kal Studio©</h2>
              <div className="text-[10px] text-brand-gold uppercase font-bold tracking-widest mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {role} portal
              </div>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 px-6 py-10 space-y-2">
          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-6 px-4">Navigation</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center justify-between group px-4 py-3 rounded transition-all ${
                  isActive 
                    ? 'bg-white/5 text-brand-gold' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <link.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-gold' : 'text-white/20 group-hover:text-white/40'}`} />
                  <span className="text-xs font-bold uppercase tracking-widest">{link.name}</span>
                </div>
                {isActive && <div className="w-1 h-1 bg-brand-gold rounded-full"></div>}
              </Link>
            )
          })}
        </nav>

        <div className="p-8 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-brand-charcoal p-6 flex justify-between items-center border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain brightness-0 invert" />
            <h2 className="text-white text-sm font-bold tracking-tighter tracking-widest">Kal Studio©</h2>
          </Link>
          <button onClick={handleLogout} className="text-white/60 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 md:p-12 lg:p-16 max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
