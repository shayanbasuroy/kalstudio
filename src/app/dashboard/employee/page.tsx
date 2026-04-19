"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MetricCard from '@/components/dashboard/MetricCard'
import { Briefcase, DollarSign, FolderOpen, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Mock Data
const myClients = [
  { id: 1, name: 'Local Resto', status: 'lead', value: '₹20,000' },
  { id: 2, name: 'Gym Pro', status: 'active', value: '₹40,000' }
]

const myProjects = [
  { id: 1, name: 'Local Resto - Landing', status: 'In Progress', deadline: 'Oct 24' }
]

export default function EmployeeDashboard() {
  const [role, setRole] = useState<'sales' | 'developer' | 'owner' | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setRole(profile?.role as any || 'sales') 
      } else {
        setRole('sales') 
      }
      setLoading(false)
    }
    checkRole()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-32">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    )
  }

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
          Focus is the catalyst for conversion.
        </div>
      </div>

      {/* Sales Section */}
      {(role === 'sales' || role === 'owner') && (
        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-brand-charcoal/10">
            <div className="border-r border-b border-brand-charcoal/10">
              <MetricCard title="Total Deals" value="12" trend="+3" trendUp={true} icon={Briefcase} />
            </div>
            <div className="border-r border-b border-brand-charcoal/10">
              <MetricCard title="Active Clients" value="5" trend="0" trendUp={true} icon={Briefcase} />
            </div>
            <div className="border-r border-b border-brand-charcoal/10">
              <MetricCard title="My Earnings" value="₹45k" trend="+₹5k" trendUp={true} icon={DollarSign} />
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">My Personal Pipeline</h2>
              <button className="text-[10px] bg-brand-charcoal text-brand-offwhite px-6 py-2 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors">
                + New Lead
              </button>
            </div>

            <div className="space-y-0 border-t border-brand-charcoal/5">
              {myClients.map((client) => (
                <div key={client.id} className="grid grid-cols-[2fr_1fr_1fr] items-center py-8 border-b border-brand-charcoal/10 group hover:bg-brand-charcoal/[0.02] transition-colors px-4">
                  <span className="text-lg font-bold text-brand-charcoal tracking-tight">{client.name}</span>
                  <div className="flex justify-center">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 border ${
                      client.status === 'active' ? 'border-brand-gold text-brand-gold' : 'border-brand-charcoal/20 text-brand-charcoal/40'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  <div className="text-right font-bold text-brand-charcoal">
                    {client.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Developer Section */}
      {role === 'developer' && (
        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-brand-charcoal/10">
            <div className="border-r border-b border-brand-charcoal/10">
              <MetricCard title="Active Projects" value="2" trend="-1" trendUp={false} icon={FolderOpen} />
            </div>
            <div className="border-r border-b border-brand-charcoal/10">
              <MetricCard title="Completed" value="8" trend="+1" trendUp={true} icon={FolderOpen} />
            </div>
            <div className="border-r border-b border-brand-charcoal/10">
              <MetricCard title="Profit Share" value="₹1.2L" trend="+₹10k" trendUp={true} icon={DollarSign} />
            </div>
          </div>
          
          <div className="space-y-10">
            <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Assigned Projects</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {myProjects.map(proj => (
                <div key={proj.id} className="group border border-brand-charcoal/10 p-8 hover:border-brand-gold transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-brand-charcoal tracking-tighter leading-none mb-2">{proj.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Deadline: {proj.deadline}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-brand-gold/10 text-brand-gold">
                      {proj.status}
                    </span>
                  </div>
                  <button className="w-full text-center py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-offwhite bg-brand-charcoal hover:bg-brand-gold transition-colors">
                    Update Progress
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
