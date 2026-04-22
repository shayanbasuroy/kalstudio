"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, Save, CheckCircle2, Loader2, Landmark, XCircle } from 'lucide-react'

export default function EmployeeSettings() {
  const [details, setDetails] = useState({
    upi_id: '',
    bank_account: '',
    ifsc: '',
    name_on_account: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('payment_details')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setDetails({
            upi_id: data.upi_id || '',
            bank_account: data.bank_account || '',
            ifsc: data.ifsc || '',
            name_on_account: data.name_on_account || ''
          })
        }
      }
      setLoading(false)
    }
    fetchSettings()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setActionError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('payment_details')
        .upsert({
          user_id: user?.id,
          ...details,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save payment details')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="max-w-3xl space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Finance</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Payment<br />
            Details.
          </h1>
        </div>
        <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
          &ldquo;Transparency and accuracy are the pillars of professional compensation.&rdquo;
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        
        {/* UPI Section */}
        <div className="bg-white border border-brand-charcoal/10 p-10 space-y-8">
          <div className="flex items-center gap-4 border-b border-brand-charcoal/5 pb-4">
            <CreditCard className="w-5 h-5 text-brand-gold" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Digital Payout (UPI)</h2>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-3 block">UPI ID / VPA</label>
            <input 
              type="text"
              value={details.upi_id}
              onChange={e => setDetails({...details, upi_id: e.target.value})}
              placeholder="username@bank"
              className="w-full p-4 bg-brand-offwhite border-none rounded-xl text-lg font-bold tracking-tight text-brand-charcoal focus:ring-1 focus:ring-brand-gold outline-none"
            />
          </div>
        </div>

        {/* Bank Section */}
        <div className="bg-white border border-brand-charcoal/10 p-10 space-y-8">
          <div className="flex items-center gap-4 border-b border-brand-charcoal/5 pb-4">
            <Landmark className="w-5 h-5 text-brand-gold" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Bank Architecture</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-3 block">Account Holder Name</label>
              <input 
                type="text"
                value={details.name_on_account}
                onChange={e => setDetails({...details, name_on_account: e.target.value})}
                className="w-full p-4 bg-brand-offwhite border-none rounded-xl font-bold text-brand-charcoal focus:ring-1 focus:ring-brand-gold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-3 block">Account Number</label>
              <input 
                type="text"
                value={details.bank_account}
                onChange={e => setDetails({...details, bank_account: e.target.value})}
                className="w-full p-4 bg-brand-offwhite border-none rounded-xl font-bold text-brand-charcoal focus:ring-1 focus:ring-brand-gold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-3 block">IFSC Code</label>
              <input 
                type="text"
                value={details.ifsc}
                onChange={e => setDetails({...details, ifsc: e.target.value})}
                className="w-full p-4 bg-brand-offwhite border-none rounded-xl font-bold text-brand-charcoal focus:ring-1 focus:ring-brand-gold outline-none"
              />
            </div>
          </div>
        </div>

        {actionError && (
          <div className="text-xs text-red-500 flex items-center gap-1 bg-red-50 p-4 border border-red-100">
            <XCircle className="w-4 h-4 shrink-0" /> {actionError}
          </div>
        )}
        <div className="flex items-center gap-6 pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-3 bg-brand-charcoal text-brand-offwhite px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {saving ? 'Synchronizing...' : 'Save Details'}
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-brand-sage animate-in fade-in slide-in-from-left-4">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Update Synchronized</span>
            </div>
          )}
        </div>

      </form>

    </div>
  )
}
