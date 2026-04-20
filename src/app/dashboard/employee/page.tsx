"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MetricCard from '@/components/dashboard/MetricCard'
import { Briefcase, DollarSign, FolderOpen, Loader2 } from 'lucide-react'

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [data, setData] = useState<any>({ gigs: [], metrics: { active: 0, earnings: 0, pending: 0 } })
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchEmployeeData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('users')
          .select('role, status')
          .eq('id', user.id)
          .single()
        
          // Owners can view this page, others need redirection check
          if (profileData?.role !== 'owner' && profileData?.role !== 'sales' && profileData?.role !== 'developer') {
            router.push('/login')
            return
          }
        setProfile(profileData)

        // 2. Fetch Payouts (Gigs) and Stats
        const { data: myPayouts } = await supabase
          .from('payouts')
          .select('*, gigs(*, clients(name))')
          .eq('user_id', user.id)

        const activeGigs = myPayouts?.filter(p => p.gigs.status !== 'completed').length || 0
        const totalEarnings = myPayouts?.filter(p => p.is_paid).reduce((acc, p) => acc + Number(p.amount), 0) || 0
        const pendingPayouts = myPayouts?.filter(p => !p.is_paid).reduce((acc, p) => acc + Number(p.amount), 0) || 0

        setData({
          gigs: myPayouts || [],
          metrics: {
            active: activeGigs,
            earnings: totalEarnings,
            pending: pendingPayouts
          }
        })
      }
      setLoading(false)
    }
    fetchEmployeeData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-32">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    )
  }

  const role = profile?.role || 'sales'

  return (
    <div className="space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Workspace</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            {role === 'developer' ? 'Engine' : 'Growth'}<br />
            Dashboard.
          </h1>
        </div>
        <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic text-right md:text-left">
          Your individual contribution is the pillar of our collective success.
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-brand-charcoal/10">
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Active Gigs" value={data.metrics.active} trend="Personal" trendUp={true} icon={Briefcase} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Total Earnings" value={`₹${data.metrics.earnings.toLocaleString()}`} trend="Settled" trendUp={true} icon={DollarSign} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Pending Payouts" value={`₹${data.metrics.pending.toLocaleString()}`} trend="Processing" trendUp={true} icon={FolderOpen} />
        </div>
      </div>
      
      {/* List Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">
            {role === 'developer' ? 'Build Assignment' : 'Sales Pipeline'}
          </h2>
          <button 
            onClick={() => router.push(role === 'developer' ? '/dashboard/employee/projects' : '/dashboard/employee/clients')}
            className="text-[10px] bg-brand-charcoal text-brand-offwhite px-6 py-2 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors"
          >
            {role === 'developer' ? 'Gigs Manager' : '+ Add Lead'}
          </button>
        </div>

        <div className="space-y-0 border-t border-brand-charcoal/5">
          {data.gigs.length > 0 ? data.gigs.map((item: any) => (
            <div key={item.gigs.id} className="grid grid-cols-[2fr_1fr_1fr] items-center py-8 border-b border-brand-charcoal/10 group hover:bg-brand-charcoal/[0.02] transition-colors px-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-brand-charcoal tracking-tight">{item.gigs.clients?.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{item.gigs.service_type}</span>
              </div>
              <div className="flex justify-center">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 border ${
                  item.gigs.status === 'in_progress' ? 'border-brand-gold text-brand-gold' : 'border-brand-charcoal/20 text-brand-charcoal/40'
                }`}>
                  {item.gigs.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-sm font-bold text-brand-charcoal tabular-nums">₹{Number(item.amount).toLocaleString()}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30">My Split</span>
              </div>
            </div>
          )) : (
            <p className="py-20 text-center text-xs font-bold uppercase tracking-widest text-brand-charcoal/20">No active assignments in your pipeline</p>
          )}
        </div>
      </div>

    </div>
  )
}
