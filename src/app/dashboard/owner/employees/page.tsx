"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, CheckCircle, XCircle, ExternalLink, Mail, Phone, Loader2 } from 'lucide-react'

interface EmployeeProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'pending' | 'active' | 'rejected'
  application_data?: {
    portfolio_link: string
    notes: string
  }
}

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEmployees = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        application_data (portfolio_link, notes)
      `)
      .neq('role', 'owner')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Staff fetch error:", error)
    } else if (data) {
      setEmployees(data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleUpdateStatus = async (id: string, status: 'active' | 'rejected') => {
    setActionLoading(id)
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status } : emp))
      
      // If approved, send notification email
      if (status === 'active') {
        const approvedUser = employees.find(e => e.id === id)
        if (approvedUser) {
          try {
            await fetch('/api/notify/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: approvedUser.email,
                name: approvedUser.name
              })
            })
          } catch (err) {
            console.error("Failed to send notification:", err)
          }
        }
      }
    }
    setActionLoading(null)
  }

  const handleResendEmail = async (emp: EmployeeProfile) => {
    setActionLoading(`resend-${emp.id}`)
    try {
      await fetch('/api/notify/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emp.email,
          name: emp.name
        })
      })
      // Optional: Add a success toast/notification here if you have one
    } catch (err) {
      console.error("Failed to resend notification:", err)
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-32">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    )
  }

  const pending = employees.filter(e => e.status === 'pending')
  const active = employees.filter(e => e.status === 'active')

  return (
    <div className="space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Management</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Staff<br />
            Database.
          </h1>
        </div>
        <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
          "The strength of the studio is the collective talent of its creators."
        </div>
      </div>

      {/* Pending Applications Section */}
      {pending.length > 0 && (
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Pending Applications</h2>
            <span className="px-2 py-0.5 bg-brand-gold text-brand-offwhite text-[10px] font-bold rounded-full">
              {pending.length} New
            </span>
          </div>

          <div className="grid gap-6">
            {pending.map((app) => (
              <div key={app.id} className="bg-white border border-brand-charcoal/10 p-8 group hover:border-brand-gold transition-colors">
                <div className="grid lg:grid-cols-[1.5fr_2fr_1fr] gap-8 items-start">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{app.role}</span>
                      <h3 className="text-2xl font-bold text-brand-charcoal tracking-tight">{app.name}</h3>
                    </div>
                    <div className="space-y-2 text-xs text-brand-charcoal/60">
                      <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {app.email}</div>
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {app.phone}</div>
                    </div>
                  </div>

                  {/* Portfolio & Notes */}
                  <div className="space-y-4 border-l border-brand-charcoal/5 pl-8">
                    {app.application_data?.portfolio_link && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/30 mb-2 block">Portfolio</span>
                        <a 
                          href={app.application_data.portfolio_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:underline"
                        >
                          View Work <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                    {app.application_data?.notes && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/30 mb-2 block">Cover Note</span>
                        <p className="text-xs text-brand-charcoal/70 leading-relaxed italic">
                          "{app.application_data.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-3 justify-end lg:justify-start">
                    <button 
                      onClick={() => handleUpdateStatus(app.id, 'active')}
                      disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-charcoal text-brand-offwhite text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold transition-colors"
                    >
                      {actionLoading === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                      disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-brand-charcoal/10 text-brand-charcoal/40 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Staff Section */}
      <div className="space-y-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Active Team Members</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/10">
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Employee</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 px-4">Role</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 px-4 text-right">Contact</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {active.map((emp) => (
                <tr key={emp.id} className="group hover:bg-brand-charcoal/[0.02] transition-colors">
                  <td className="py-6">
                    <div className="font-bold text-brand-charcoal">{emp.name}</div>
                    <div className="text-[10px] text-brand-charcoal/40 font-medium">{emp.email}</div>
                  </td>
                  <td className="py-6 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-offwhite border border-brand-charcoal/5 text-brand-charcoal/60">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right tabular-nums text-xs text-brand-charcoal/60">
                    {emp.phone}
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => handleResendEmail(emp)}
                        disabled={!!actionLoading}
                        className="p-2 text-brand-charcoal/30 hover:text-brand-gold transition-colors"
                        title="Resend Welcome Email"
                      >
                        {actionLoading === `resend-${emp.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sage">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-pulse"></div>
                        Verified
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {active.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-brand-charcoal/30 italic text-sm">
                    No active staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
