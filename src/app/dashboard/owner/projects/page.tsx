"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Briefcase, Calendar, CheckSquare, Clock, ArrowUpRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

  interface UserProfile {
    name: string
    phone: string
    email: string
  }

  interface Gig {
    id: string
    client_id: string
    service_type: string
    total_amount: number
    status: string
    deadline: string
    clients: { name: string; business: string }
    sales?: UserProfile
    developer?: UserProfile
  }

  export default function GigsPage() {
    const [gigs, setGigs] = useState<Gig[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const supabase = createClient()

    const fetchGigs = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          clients (name, business),
          sales:users!sales_id (name, phone, email),
          developer:users!developer_id (name, phone, email)
        `)
        .order('created_at', { ascending: false })

      if (error) console.error("Fetch gigs error:", error)
      if (data) setGigs(data as any)
      setLoading(false)
    }

    useEffect(() => {
      fetchGigs()
    }, [])

    const filteredGigs = filter === 'all' 
      ? gigs 
      : gigs.filter(g => g.status === filter)

    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Operations</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
              Gig<br />
              Manager.
            </h1>
          </div>
          <Link 
            href="/dashboard/owner/projects/new"
            className="w-full md:w-auto text-center flex items-center justify-center gap-3 bg-brand-charcoal text-brand-offwhite px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10"
          >
            <Plus className="w-4 h-4" /> Initialize New Gig
          </Link>
        </div>

        {/* Grid Tabs - Scrollable on mobile */}
        <div className="flex gap-1 border-b border-brand-charcoal/10 pb-px overflow-x-auto no-scrollbar">
          {['all', 'lead', 'confirmed', 'in_progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f ? 'bg-brand-charcoal text-brand-offwhite' : 'text-brand-charcoal/40 hover:text-brand-charcoal'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Main List */}
        <div className="grid gap-6 bg-transparent">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>
          ) : filteredGigs.length > 0 ? (
            <div className="grid gap-8">
              {filteredGigs.map((gig) => (
                <div key={gig.id} className="bg-white border border-brand-charcoal/10 p-6 md:p-10 group hover:border-brand-gold transition-all">
                  <div className="grid lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 items-start">
                    
                    {/* Service & Client */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-brand-gold">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{gig.service_type}</span>
                      </div>
                      <h3 className="text-3xl font-bold tracking-tighter text-brand-charcoal group-hover:text-brand-gold transition-colors leading-tight">{gig.clients.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/30">{gig.clients.business}</p>
                    </div>

                    {/* Team Squad - COORDINATION FEATURE */}
                    <div className="space-y-4 border-l border-brand-charcoal/5 pl-6 lg:pl-10">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 block mb-4">Project Squad</span>
                      <div className="space-y-6">
                        {gig.sales && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-brand-charcoal">{gig.sales.name} <span className="text-brand-gold font-medium ml-1">(Sales)</span></p>
                            <div className="flex gap-3 mt-2">
                              <a href={`tel:${gig.sales.phone}`} className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold">Call</a>
                              <a href={`mailto:${gig.sales.email}`} className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold">Email</a>
                            </div>
                          </div>
                        )}
                        {gig.developer && (
                          <div className="space-y-1 pt-2 border-t border-brand-charcoal/5">
                            <p className="text-[10px] font-bold text-brand-charcoal">{gig.developer.name} <span className="text-brand-gold font-medium ml-1">(Dev)</span></p>
                            <div className="flex gap-3 mt-2">
                              <a href={`tel:${gig.developer.phone}`} className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold">Call</a>
                              <a href={`mailto:${gig.developer.email}`} className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold">Email</a>
                            </div>
                          </div>
                        )}
                        {!gig.sales && !gig.developer && (
                          <p className="text-[10px] italic text-brand-charcoal/30 uppercase tracking-widest">Team not assigned</p>
                        )}
                      </div>
                    </div>

                    {/* Finance & Deadline */}
                    <div className="space-y-6 lg:border-l border-brand-charcoal/5 lg:pl-10">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 mb-2 block">Deal Value</span>
                        <p className="text-xl font-bold text-brand-charcoal tabular-nums">₹{gig.total_amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                        <Clock className="w-3.5 h-3.5 text-brand-gold" />
                        {gig.deadline ? new Date(gig.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Flexible'}
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex flex-col gap-8 justify-between lg:items-end">
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 mb-2 block">Current Phase</span>
                        <div className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 border w-fit ${
                          gig.status === 'completed' ? 'bg-brand-sage/10 border-brand-sage text-brand-sage' :
                          gig.status === 'in_progress' ? 'bg-brand-gold/5 border-brand-gold text-brand-gold' :
                          'border-brand-charcoal/20 text-brand-charcoal/30'
                        }`}>
                          {gig.status.replace('_', ' ')}
                        </div>
                      </div>
                      <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal hover:text-brand-gold transition-colors">
                        Project Workspace <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 border-2 border-dashed border-brand-charcoal/5">
              <CheckSquare className="w-12 h-12 text-brand-charcoal/5 mx-auto mb-6" />
              <p className="text-sm text-brand-charcoal/30 italic">No active gigs in this category.</p>
              <Link href="/dashboard/owner/projects/new" className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:underline mt-4 inline-block">
                Create First Gig
              </Link>
            </div>
          )}
        </div>

      </div>
    )
  }
