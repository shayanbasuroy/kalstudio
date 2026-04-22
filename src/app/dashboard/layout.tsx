"use client"
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, FolderOpen, LogOut, Loader2, DollarSign, Library, Search, Bell, X, MessageSquare, CheckCircle, ArrowUpRight, Briefcase } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'owner' | 'sales' | 'developer' | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; label: string; sub: string; href: string }[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searching, setSearching] = useState(false)
  const [notifications, setNotifications] = useState<{ id: string; type: string; message: string; link: string | null; is_read: boolean; created_at: string }[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
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
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role) {
        setRole(profile.role as 'owner' | 'sales' | 'developer')
      } else {
        setRole(pathname.includes('/owner') ? 'owner' : 'sales')
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [pathname, router, supabase])

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;
    async function fetchNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, supabase]);

  // Global search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const q = `%${searchQuery.trim()}%`;
      const [gigRes, clientRes] = await Promise.all([
        supabase.from("gigs").select("id, clients(name), service_type").ilike("clients.name", q).limit(5),
        supabase.from("clients").select("id, name, business").ilike("name", q).limit(5),
      ]);
      const results: typeof searchResults = [];
      (gigRes.data || []).forEach((g: { id: string; clients: { name: string } | { name: string }[]; service_type: string }) => {
        const clientName = Array.isArray(g.clients) ? g.clients[0]?.name : (g.clients as { name: string })?.name;
        if (clientName) results.push({ type: "project", id: g.id, label: clientName, sub: g.service_type, href: `/dashboard/owner/projects/${g.id}` });
      });
      (clientRes.data || []).forEach((c: { id: string; name: string; business: string }) => {
        results.push({ type: "client", id: c.id, label: c.name, sub: c.business, href: `/dashboard/owner/clients` });
      });
      setSearchResults(results);
      setShowSearch(results.length > 0);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, supabase]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (notifId: string, link: string | null) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setShowNotifications(false);
    if (link) router.push(link);
  };

  const notifIcon = (type: string) => {
    switch (type) {
      case "comment": return <MessageSquare className="w-3.5 h-3.5 text-brand-gold" />;
      case "status": return <CheckCircle className="w-3.5 h-3.5 text-brand-sage" />;
      default: return <Bell className="w-3.5 h-3.5 text-brand-charcoal/40" />;
    }
  };

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
    { name: 'Materials', href: '/dashboard/owner/materials', icon: Library },
    { name: 'Revenue', href: '/dashboard/owner/revenue', icon: DollarSign },
    { name: 'Employee View', href: '/dashboard/employee', icon: LayoutDashboard },
  ] : [
    { name: 'My Dashboard', href: '/dashboard/employee', icon: LayoutDashboard },
    { name: 'Clients/Leads', href: '/dashboard/employee/clients', icon: Users },
    { name: 'Projects', href: '/dashboard/employee/projects', icon: FolderOpen },
    { name: 'Materials', href: '/dashboard/employee/materials', icon: Library },
    { name: 'Payment Info', href: '/dashboard/employee/settings', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-brand-offwhite flex font-sans">
      {/* Sidebar - Editorial Dark */}
      <aside className="w-72 bg-brand-charcoal text-brand-offwhite flex flex-col hidden md:flex border-r border-white/5">
        <div className="p-10 border-b border-white/10">
          <div className="flex items-start justify-between">
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
            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-white/5 rounded transition-colors"
              >
                <Bell className="w-5 h-5 text-white/60" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded shadow-2xl border border-brand-charcoal/10 max-h-96 overflow-y-auto z-50">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleMarkRead(n.id, n.link)}
                        className="w-full text-left p-4 border-b border-brand-charcoal/5 hover:bg-brand-offwhite transition-colors flex items-start gap-3"
                      >
                        <div className="mt-0.5">{notifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${n.is_read ? "text-brand-charcoal/60" : "text-brand-charcoal font-bold"}`}>
                            {n.message}
                          </p>
                          <p className="text-[9px] text-brand-charcoal/30 mt-1">
                            {new Date(n.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 bg-brand-gold rounded-full shrink-0 mt-1.5"></div>}
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Bell className="w-6 h-6 text-brand-charcoal/10 mx-auto mb-2" />
                      <p className="text-xs text-brand-charcoal/30 italic">No notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div ref={searchRef} className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, clients..."
              className="w-full bg-white/5 border border-white/10 pl-10 pr-10 py-2.5 text-xs text-white/80 placeholder:text-white/30 focus:border-brand-gold outline-none transition-colors"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-white/30" />
            )}
            {searchQuery && !searching && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearch(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-white/30 hover:text-white transition-colors" />
              </button>
            )}
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded shadow-2xl border border-brand-charcoal/10 max-h-72 overflow-y-auto z-50">
              {searchResults.map((r) => (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={r.href}
                  onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                  className="flex items-center gap-3 p-4 border-b border-brand-charcoal/5 hover:bg-brand-offwhite transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-charcoal/5 flex items-center justify-center shrink-0">
                    {r.type === "project" ? (
                      <Briefcase className="w-3.5 h-3.5 text-brand-gold" />
                    ) : (
                      <Users className="w-3.5 h-3.5 text-brand-charcoal/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-brand-charcoal">{r.label}</p>
                    <p className="text-[9px] text-brand-charcoal/40">{r.sub}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-charcoal/20 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-6 py-10 space-y-2">
          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-6 px-4">Navigation</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard/owner' && link.href !== '/dashboard/employee' && pathname.startsWith(link.href + '/'))
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
