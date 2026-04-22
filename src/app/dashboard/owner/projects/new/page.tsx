"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, IndianRupee, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  business: string
}

interface Staff {
  id: string
  name: string
  role: string
  email: string
}

export default function NewGigPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [clients, setClients] = useState<Client[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  
  const [formData, setFormData] = useState({
    client_id: '',
    service_type: 'landing',
    total_amount: 0,
    deadline: '',
    sales_id: '',
    developer_id: '',
    payout_sales: 0,
    payout_dev: 0
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const [{ data: clientsData }, { data: staffData }] = await Promise.all([
        supabase.from('clients').select('id, name, business'),
        supabase.from('users').select('id, name, role, email').neq('role', 'owner').eq('status', 'active')
      ])
      
      if (clientsData) setClients(clientsData)
      if (staffData) setStaff(staffData)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const salesPeople = staff.filter(s => s.role === 'sales')
  const developers = staff.filter(s => s.role === 'developer')

  const handleFinalSubmit = async () => {
    setSaving(true)
    setError(null)
    
    // 1. Create the Gig
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .insert({
        client_id: formData.client_id,
        sales_id: formData.sales_id || null,
        developer_id: formData.developer_id || null,
        service_type: formData.service_type,
        total_amount: formData.total_amount,
        deadline: formData.deadline || null,
        status: 'confirmed'
      })
      .select()
      .single()

    if (gigError) {
      setError(gigError.message)
      setSaving(false)
      return
    }

    try {
      // 2. Create the Payouts
      const payouts = [
        { gig_id: gig.id, user_id: formData.sales_id, role: 'sales', amount: formData.payout_sales },
        { gig_id: gig.id, user_id: formData.developer_id, role: 'developer', amount: formData.payout_dev }
      ].filter(p => p.user_id && p.amount > 0)

      if (payouts.length > 0) {
        const { error: payoutError } = await supabase.from('payouts').insert(payouts)
        if (payoutError) console.error("Payout creation error:", payoutError)
      }

      // 3. Trigger Assignment Notifications
      const client = clients.find(c => c.id === formData.client_id)
      const salesMember = staff.find(s => s.id === formData.sales_id)
      const devMember = staff.find(s => s.id === formData.developer_id)

      const notifications = []
      if (salesMember && salesMember.email) {
        notifications.push(fetch('/api/notify/assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: salesMember.email,
            name: salesMember.name,
            clientName: client?.name,
            serviceType: formData.service_type,
            deadline: formData.deadline || 'Flexible'
          })
        }))
      }
      if (devMember && devMember.email) {
        notifications.push(fetch('/api/notify/assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: devMember.email,
            name: devMember.name,
            clientName: client?.name,
            serviceType: formData.service_type,
            deadline: formData.deadline || 'Flexible'
          })
        }))
      }

      try {
        await Promise.all(notifications)
      } catch (err) {
        console.error("Assignment notifications failed:", err)
      }

      router.push('/dashboard/owner/projects')
      } catch (_err: unknown) {
       setError(_err instanceof Error ? _err.message : "An unexpected error occurred.")
       setSaving(false)
     }
  }

  if (loading) return <div className="p-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-brand-charcoal/10 pb-10">
        <Link href="/dashboard/owner/projects" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Pipeline
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Step {step} of 4</p>
            <h1 className="text-6xl font-bold tracking-tighter text-brand-charcoal leading-none italic">
              Initialize.<br />
              New Gig.
            </h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 w-8 rounded-full transition-colors ${step >= s ? 'bg-brand-gold' : 'bg-brand-charcoal/10'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 text-xs font-bold uppercase tracking-widest border border-red-100">{error}</div>}

      {/* Steps Content */}
      <div className="bg-white p-12 lg:p-16 border border-brand-charcoal/10">
        
        {step === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">01. Select Client Partner</h2>
            <div className="grid gap-4">
              {clients.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFormData({...formData, client_id: c.id})}
                  className={`flex justify-between items-center p-8 border text-left transition-all ${
                    formData.client_id === c.id ? 'border-brand-gold bg-brand-offwhite' : 'border-brand-charcoal/5 hover:border-brand-gold/30'
                  }`}
                >
                  <div>
                    <p className="text-xl font-bold text-brand-charcoal">{c.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{c.business}</p>
                  </div>
                  {formData.client_id === c.id && <Check className="text-brand-gold w-6 h-6" />}
                </button>
              ))}
              {clients.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-brand-charcoal/5 italic text-brand-charcoal/40 uppercase text-[10px] tracking-widest">
                  No clients found. <Link href="/dashboard/owner/clients" className="text-brand-gold font-bold">Add One First</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">02. Gig Details & Value</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Service Type</label>
                <select 
                  className="w-full p-4 bg-brand-offwhite border-none rounded-xl font-bold text-brand-charcoal"
                  value={formData.service_type}
                  onChange={e => setFormData({...formData, service_type: e.target.value})}
                >
                  <option value="landing">Landing Page</option>
                  <option value="multipage">Multi-page Solution</option>
                  <option value="custom">Custom Web App</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Total Project Value (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/30" />
                  <input 
                    type="number" 
                    className="w-full pl-12 pr-4 py-4 bg-brand-offwhite border-none rounded-xl font-bold text-brand-charcoal"
                    value={formData.total_amount}
                    onChange={e => setFormData({...formData, total_amount: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Target Deadline (Optional)</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-brand-offwhite border-none rounded-xl font-bold text-brand-charcoal"
                  value={formData.deadline}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">03. Assign Strategic Team</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Sales Lead</label>
                <div className="grid gap-2">
                  {salesPeople.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setFormData({...formData, sales_id: s.id})}
                      className={`p-4 border text-left text-xs font-bold uppercase tracking-widest transition-all ${
                        formData.sales_id === s.id ? 'border-brand-gold bg-brand-offwhite text-brand-gold' : 'border-brand-charcoal/5 hover:border-brand-gold/30'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Developer Assigned</label>
                <div className="grid gap-2">
                  {developers.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setFormData({...formData, developer_id: d.id})}
                      className={`p-4 border text-left text-xs font-bold uppercase tracking-widest transition-all ${
                        formData.developer_id === d.id ? 'border-brand-gold bg-brand-offwhite text-brand-gold' : 'border-brand-charcoal/5 hover:border-brand-gold/30'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">04. Financial Split Configuration</h2>
            <div className="p-8 bg-brand-offwhite border border-brand-charcoal/5 flex justify-between items-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Total Project Revenue</p>
              <p className="text-2xl font-bold text-brand-charcoal">₹{formData.total_amount.toLocaleString()}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Sales Commission (₹)</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-white border border-brand-charcoal/10 rounded-xl font-bold text-brand-charcoal"
                  value={formData.payout_sales}
                  onChange={e => setFormData({...formData, payout_sales: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Developer Split (₹)</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-white border border-brand-charcoal/10 rounded-xl font-bold text-brand-charcoal"
                  value={formData.payout_dev}
                  onChange={e => setFormData({...formData, payout_dev: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="p-8 border-t border-brand-charcoal/5 mt-8 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Total Payouts</p>
                <p className="text-xl font-bold text-brand-charcoal">₹{(formData.payout_sales + formData.payout_dev).toLocaleString()}</p>
              </div>
              <div className="text-right text-brand-sage">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sage/60">Estimated Net Profit</p>
                <p className="text-xl font-bold">₹{(formData.total_amount - formData.payout_sales - formData.payout_dev).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-brand-charcoal/10">
        <button 
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold disabled:opacity-0 transition-all font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Previous Step
        </button>
        {step < 4 ? (
          <button 
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && !formData.client_id}
            className="flex items-center gap-3 bg-brand-charcoal text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl disabled:opacity-50"
          >
            Next Phase <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handleFinalSubmit}
            disabled={saving}
            className="flex items-center gap-3 bg-brand-gold text-white px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-charcoal transition-all shadow-xl shadow-brand-gold/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Initialize Production
          </button>
        )}
      </div>

    </div>
  )
}
