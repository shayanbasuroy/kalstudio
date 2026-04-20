"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Wallet, TrendingUp, CreditCard, Loader2, Upload, Check, Image as ImageIcon, X } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'

export default function RevenuePage() {
  const [data, setData] = useState<any>({ payments: [], payouts: [], stats: { total: 0, payouts: 0, profit: 0 } })
  const [loading, setLoading] = useState(true)
  const [settleModal, setSettleModal] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const [{ data: payments }, { data: payouts }] = await Promise.all([
      supabase.from('payments').select('*, gigs(clients(name))').order('received_at', { ascending: false }),
      supabase.from('payouts').select('*, users(name), gigs(clients(name))').order('created_at', { ascending: false })
    ])

    const totalRevenue = payments?.reduce((acc, p) => acc + Number(p.amount_received), 0) || 0
    const totalPayouts = payouts?.filter(p => p.is_paid).reduce((acc, p) => acc + Number(p.amount), 0) || 0
    
    setData({
      payments: payments || [],
      payouts: payouts || [],
      stats: {
        total: totalRevenue,
        payouts: totalPayouts,
        profit: totalRevenue - totalPayouts
      }
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSettle = async () => {
    if (!settleModal || !file) return
    setUploading(true)
    
    try {
      // 1. Upload Screenshot
      const fileExt = file.name.split('.').pop()
      const fileName = `${settleModal.id}-${Math.random()}.${fileExt}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file)

      if (storageError) throw storageError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)

      // 3. Update Payout record
      const { error: updateError } = await supabase
        .from('payouts')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          proof_url: publicUrl
        })
        .eq('id', settleModal.id)

      if (updateError) throw updateError

      setSettleModal(null)
      setFile(null)
      fetchData()
    } catch (err) {
      console.error("Settlement failed:", err)
      alert("Failed to settle payout. Check console.")
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Treasury</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Financial<br />
            Ledger.
          </h1>
        </div>
        <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
          "Cash flow is the lifeblood of creative ambition."
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-brand-charcoal/10">
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Gross Revenue" value={`₹${data.stats.total.toLocaleString()}`} trend="Real-time" trendUp={true} icon={DollarSign} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Settled Payouts" value={`₹${data.stats.payouts.toLocaleString()}`} trend="Staff Cost" trendUp={false} icon={Wallet} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Net Profit" value={`₹${data.stats.profit.toLocaleString()}`} trend="Agency Margin" trendUp={true} icon={TrendingUp} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* Incoming Ledger */}
        <div className="space-y-10">
          <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Incoming Payments</h2>
            <span className="text-[10px] font-bold text-brand-sage uppercase tracking-widest">Verified Cash</span>
          </div>
          <div className="space-y-8">
            {data.payments.length > 0 ? data.payments.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center group">
                <div>
                  <h4 className="text-xl font-bold text-brand-charcoal tracking-tight">{p.gigs?.clients?.name || 'Unknown Client'}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{new Date(p.received_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-charcoal tabular-nums">+₹{Number(p.amount_received).toLocaleString()}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-sage">{p.payment_method}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm italic text-brand-charcoal/30 py-10 text-center border border-dashed border-brand-charcoal/10 uppercase tracking-widest text-[10px] font-bold">No payments recorded</p>
            )}
          </div>
        </div>

        {/* Payout Ledger */}
        <div className="space-y-10">
          <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Staff Payouts</h2>
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Expense Logic</span>
          </div>
          <div className="space-y-8">
            {data.payouts.length > 0 ? data.payouts.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center group">
                <div>
                  <h4 className="text-xl font-bold text-brand-charcoal tracking-tight">{p.users?.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{p.gigs?.clients?.name} — {p.role}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-brand-charcoal tabular-nums">₹{Number(p.amount).toLocaleString()}</p>
                  {p.is_paid ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-brand-sage/10 text-brand-sage border border-brand-sage">Settled</span>
                      {p.proof_url && (
                        <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-[8px] font-bold uppercase tracking-widest text-brand-gold hover:underline flex items-center gap-1">
                          <ImageIcon className="w-2 h-2" /> View Proof
                        </a>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSettleModal(p)}
                      className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-charcoal text-white hover:bg-brand-gold transition-colors"
                    >
                      Settle Now
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-sm italic text-brand-charcoal/30 py-10 text-center border border-dashed border-brand-charcoal/10 uppercase tracking-widest text-[10px] font-bold">No payouts scheduled</p>
            )}
          </div>
        </div>

      </div>

      {/* Settle Modal */}
      {settleModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-bold tracking-tighter text-brand-charcoal italic">Settle Payout.</h2>
              <button onClick={() => setSettleModal(null)} className="text-brand-charcoal/20 hover:text-brand-charcoal"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 bg-brand-offwhite border border-brand-charcoal/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Paying To</p>
                <p className="text-xl font-bold text-brand-charcoal">{settleModal.users?.name}</p>
                <p className="text-2xl font-bold text-brand-gold mt-4 tabular-nums">₹{Number(settleModal.amount).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4 block">Upload GPay/Transaction Screenshot</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${
                    file ? 'border-brand-sage bg-brand-sage/5' : 'border-brand-charcoal/10 group-hover:border-brand-gold'
                  }`}>
                    {file ? (
                      <>
                        <Check className="w-8 h-8 text-brand-sage mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sage text-center">{file.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-brand-charcoal/20 group-hover:text-brand-gold mb-2 transition-colors" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 group-hover:text-brand-charcoal">Select Image</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSettle}
                disabled={uploading || !file}
                className="w-full py-5 bg-brand-charcoal text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {uploading ? 'Settling...' : 'Confirm Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
