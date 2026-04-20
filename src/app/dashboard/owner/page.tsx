"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Users, Briefcase, FileText, ArrowRight, Loader2 } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import Link from 'next/link'

export default function OwnerDashboard() {
  const [data, setData] = useState<any>({ gigs: [], metrics: { revenue: 0, profit: 0, active: 0, payouts: 0 } })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: gigs } = await supabase
        .from('gigs')
        .select('*, clients(name, business), payments(amount_received), payouts(amount, is_paid)')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: allPayments } = await supabase.from('payments').select('amount_received')
      const { data: allPayouts } = await supabase.from('payouts').select('amount').eq('is_paid', true)
      const { count: activeCount } = await supabase.from('gigs').select('*', { count: 'exact', head: true }).neq('status', 'completed')
      const { data: pendingPayouts } = await supabase.from('payouts').select('amount').eq('is_paid', false)

      const revenue = allPayments?.reduce((acc, p) => acc + Number(p.amount_received), 0) || 0
      const settledPayouts = allPayouts?.reduce((acc, p) => acc + Number(p.amount), 0) || 0
      const pending = pendingPayouts?.reduce((acc, p) => acc + Number(p.amount), 0) || 0

      setData({
        gigs: gigs || [],
        metrics: {
          revenue: revenue,
          profit: revenue - settledPayouts,
          active: activeCount || 0,
          payouts: pending
        }
      })
      setLoading(false)
    }
    fetchDashboardData()
  }, [])

  if (loading) return <div className="p-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Agency OS V2</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Owner<br />
            Overview.
          </h1>
        </div>
        <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic text-right md:text-left">
          "The scale of your vision determines the height of your architecture."
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-brand-charcoal/10">
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Total Revenue" value={`₹${data.metrics.revenue.toLocaleString()}`} trend="Cash" trendUp={true} icon={DollarSign} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Net Profit" value={`₹${data.metrics.profit.toLocaleString()}`} trend="Margin" trendUp={true} icon={Briefcase} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Active Gigs" value={data.metrics.active} trend="Pipeline" trendUp={true} icon={FileText} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Pending Payouts" value={`₹${data.metrics.payouts.toLocaleString()}`} trend="Due" trendUp={false} icon={Users} />
        </div>
      </div>

      {/* Main Gigs Grid */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 lg:gap-24">
        
        {/* Recent Gigs List */}
        <div className="space-y-10">
          <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Global Pipeline</h2>
            <Link href="/dashboard/owner/projects" className="text-[10px] font-bold text-brand-gold hover:text-brand-charcoal uppercase tracking-widest transition-colors flex items-center gap-1">
              Full Manager <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-0 border-t border-brand-charcoal/5">
            {data.gigs.length > 0 ? data.gigs.map((gig: any) => (
              <div key={gig.id} className="grid grid-cols-[2fr_1fr_1fr] items-center py-8 border-b border-brand-charcoal/10 group hover:bg-brand-charcoal/[0.02] transition-colors px-4">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-brand-charcoal tracking-tight">{gig.clients?.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{gig.service_type}</span>
                </div>
                <div className="flex justify-center">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 border whitespace-nowrap ${
                    gig.status === 'completed' ? 'border-brand-sage text-brand-sage' : 
                    'border-brand-gold text-brand-gold'
                  }`}>
                    {gig.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right font-bold text-brand-charcoal tabular-nums">
                  ₹{Number(gig.total_amount).toLocaleString()}
                </div>
              </div>
            )) : (
              <p className="py-20 text-center text-xs font-bold uppercase tracking-widest text-brand-charcoal/20">No projects record yet</p>
            )}
          </div>
        </div>

        {/* Financial Splitting Section */}
        <div className="space-y-10">
          <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Quick Treasury</h2>
            <Link href="/dashboard/owner/revenue" className="text-[10px] font-bold text-brand-gold hover:text-brand-charcoal uppercase tracking-widest transition-colors">
              Finance
            </Link>
          </div>
          
          <div className="space-y-12">
            {data.gigs.length > 0 ? data.gigs.slice(0, 3).map((gig: any) => {
              const totalPayout = gig.payouts?.reduce((acc: any, val: any) => acc + Number(val.amount), 0) || 0
              const profit = Number(gig.total_amount) - totalPayout
              const margin = (profit / Number(gig.total_amount)) * 100

              return (
                <div key={gig.id} className="space-y-4 group">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-xl font-bold text-brand-charcoal tracking-tight leading-none mb-2">{gig.clients?.name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Total: ₹{Number(gig.total_amount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block mb-1">
                        Margin: {margin.toFixed(0)}%
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30">
                        Profit: ₹{profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full h-px bg-brand-charcoal/10">
                    <div 
                      className="absolute top-0 left-0 h-px bg-brand-gold transition-all duration-1000" 
                      style={{ width: `${margin}%` }}
                    ></div>
                  </div>
                </div>
              )
            }) : (
              <p className="py-20 text-center text-xs font-bold uppercase tracking-widest text-brand-charcoal/20">Awaiting financial events</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
