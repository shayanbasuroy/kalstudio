"use client"
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, Clock, ArrowUpRight, Loader2, Image as ImageIcon, X, Users, Phone, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  phone: string
  email: string
}

interface Client {
  name: string
}

interface Gig {
  id: string
  service_type: string
  status: string
  deadline: string | null
  clients: Client
  sales: User
  developer: User
}

interface Payout {
  amount: string | number
  is_paid: boolean
  proof_url: string | null
  gigs: Gig
}

interface EnhancedPayout extends Payout {
  counterpart: User | null
}

export default function EmployeeProjects() {
  const [projects, setProjects] = useState<EnhancedPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProof, setSelectedProof] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

    const fetchMyProjects = useCallback(async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('payouts')
        .select(`
          amount,
          is_paid,
          proof_url,
          gigs (
            id,
            service_type,
            status,
            deadline,
            clients (name),
            sales:users!sales_id (id, name, phone, email),
            developer:users!developer_id (id, name, phone, email)
          )
        `)
        .eq('user_id', user.id)

      if (data) {
        const enhancedData = (data as unknown as Payout[]).map((p) => {
          const isSales = p.gigs.sales?.id === user.id
          const counterpart = (isSales ? p.gigs.developer : p.gigs.sales) ?? null
          return { ...p, counterpart }
        })
        setProjects(enhancedData)
      }
      setLoading(false)
    }, [supabase])

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMyProjects()
    }, [fetchMyProjects])

    return (
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Portfolio</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
              Active<br />
              Projects.
            </h1>
          </div>
          <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
            &ldquo;Your work is the physical manifestation of our brand promise.&rdquo;
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>
          ) : projects.length > 0 ? (
            projects.map((p) => (
               <div key={p.gigs.id} className="bg-white border border-brand-charcoal/10 p-6 md:p-10 group hover:border-brand-gold transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-brand-gold">
                        <Briefcase className="w-3 h-3" />
                         <span className="text-[9px] font-bold uppercase tracking-widest">{p.gigs.service_type}</span>
                      </div>
                       <h3 className="text-3xl font-bold tracking-tighter text-brand-charcoal leading-none">{p.gigs.clients?.name}</h3>
                    </div>
                    <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 border whitespace-nowrap ${
                       p.gigs.status === 'completed' ? 'border-brand-sage text-brand-sage' : 'border-brand-gold text-brand-gold'
                    }`}>
                      {p.gigs.status.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Coordination Section */}
                  {p.counterpart && (
                    <div className="mb-8 p-6 bg-brand-offwhite border border-brand-charcoal/5 rounded-2xl relative overflow-hidden group/team">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Users className="w-12 h-12" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 block mb-3">Mission Partner</span>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-bold text-brand-charcoal">{p.counterpart.name}</p>
                          <p className="text-[9px] font-bold text-brand-gold uppercase tracking-widest mt-1">Direct Coordination</p>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={`tel:${p.counterpart.phone}`}
                            className="p-3 bg-white border border-brand-charcoal/5 rounded-full hover:bg-brand-charcoal hover:text-white transition-all shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a 
                            href={`mailto:${p.counterpart.email}`}
                            className="p-3 bg-white border border-brand-charcoal/5 rounded-full hover:bg-brand-charcoal hover:text-white transition-all shadow-sm"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-8 border-y border-brand-charcoal/5 py-8 mb-8">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 block mb-2">My Split</span>
                      <p className="text-lg font-bold text-brand-charcoal tabular-nums">₹{Number(p.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 block mb-2">Deadline</span>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                        <Clock className="w-3 h-3" />
                        {p.gigs.deadline ? new Date(p.gigs.deadline).toLocaleDateString('en-IN', { month: 'short' }) : 'ASAP'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.is_paid ? 'bg-brand-sage' : 'bg-brand-gold animate-pulse'}`}></div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40">
                        {p.is_paid ? 'Payout Settled' : 'Payment Processing'}
                      </span>
                    </div>
                    {p.is_paid && p.proof_url && (
                      <button 
                        onClick={() => setSelectedProof(p.proof_url)}
                        className="text-[9px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-charcoal flex items-center gap-2 transition-colors border-b border-brand-gold/20"
                      >
                        <ImageIcon className="w-3 h-3" /> View Proof
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => router.push(`/dashboard/owner/projects/${p.gigs.id}`)}
                    className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-offwhite bg-brand-charcoal hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 rounded-xl shadow-xl shadow-brand-charcoal/5"
                  >
                    Project Workspace <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-40 border-2 border-dashed border-brand-charcoal/5">
              <p className="text-sm text-brand-charcoal/30 italic">No assigned projects found in your pipeline.</p>
            </div>
          )}
        </div>

        {/* Proof Modal */}
        {selectedProof && (
          <div className="fixed inset-0 bg-brand-charcoal/90 backdrop-blur-md z-[120] flex items-center justify-center p-6 sm:p-20">
            <button 
              onClick={() => setSelectedProof(null)}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={selectedProof} 
                 alt="Payment Proof" 
                 className="max-w-full max-h-full object-contain shadow-2xl border border-white/10 rounded-lg"
               />
            </div>
          </div>
        )}

      </div>
    )
  }
