"use client"
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Wallet, TrendingUp, CreditCard, Loader2, Upload, Check, Image as ImageIcon, X, Edit, XCircle, CheckCircle, Calendar, User, Briefcase } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'

interface Payment {
  id: string
  amount_received: number
  payment_method: string
  received_at: string
  gigs?: {
    clients?: {
      name: string
    }
  }
}

interface Payout {
  id: string
  amount: number
  is_paid: boolean
  paid_at?: string | null
  proof_url?: string
  role: string
  users?: {
    name: string
  }
  gigs?: {
    clients?: {
      name: string
    }
  }
  created_at: string
}

interface RevenueStats {
  total: number
  payouts: number
  profit: number
}

interface RevenueData {
  payments: Payment[]
  payouts: Payout[]
  stats: RevenueStats
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData>({ payments: [], payouts: [], stats: { total: 0, payouts: 0, profit: 0 } })
  const [loading, setLoading] = useState(true)
  const [settleModal, setSettleModal] = useState<Payout | null>(null)
  const [editModal, setEditModal] = useState<Payout | null>(null)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'pending' | 'paid'>('all')
  
  const supabase = createClient()

  const fetchData = useCallback(async () => {
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
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleSettle = async () => {
    if (!settleModal || !file) return
    setUploading(true)
    
    try {
      // 1. Upload Screenshot
      const fileExt = file.name.split('.').pop()
      const fileName = `${settleModal.id}-${Math.random()}.${fileExt}`
      const { data: _, error: storageError } = await supabase.storage
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

  const handleUpdatePayout = async () => {
    if (!editModal) return
    setUploading(true)
    
    try {
      let proofUrl = editModal.proof_url
      
      // If new file uploaded, replace the old one
      if (editFile) {
        const fileExt = editFile.name.split('.').pop()
        const fileName = `${editModal.id}-${Math.random()}.${fileExt}`
        const { data: _, error: storageError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, editFile)

        if (storageError) throw storageError

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName)
        
        proofUrl = publicUrl
      }

      // Update Payout record
      const { error: updateError } = await supabase
        .from('payouts')
        .update({
          is_paid: editModal.is_paid,
          paid_at: editModal.is_paid ? (editModal.paid_at || new Date().toISOString()) : null,
          proof_url: proofUrl
        })
        .eq('id', editModal.id)

      if (updateError) throw updateError

      setEditModal(null)
      setEditFile(null)
      fetchData()
    } catch (err) {
      console.error("Update failed:", err)
      alert("Failed to update payout. Check console.")
    } finally {
      setUploading(false)
    }
  }

  const handleTogglePaidStatus = async (payout: Payout) => {
    const newStatus = !payout.is_paid
    const { error } = await supabase
      .from('payouts')
      .update({
        is_paid: newStatus,
        paid_at: newStatus ? new Date().toISOString() : null
      })
      .eq('id', payout.id)

    if (error) {
      console.error("Toggle failed:", error)
      alert("Failed to update status. Check console.")
    } else {
      fetchData()
    }
  }

  const filteredPayouts = data.payouts.filter(p => {
    if (payoutFilter === 'all') return true
    if (payoutFilter === 'paid') return p.is_paid
    if (payoutFilter === 'pending') return !p.is_paid
    return true
  })

  const pendingAmount = data.payouts.filter(p => !p.is_paid).reduce((acc, p) => acc + Number(p.amount), 0)
  const paidAmount = data.payouts.filter(p => p.is_paid).reduce((acc, p) => acc + Number(p.amount), 0)

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
          &ldquo;Cash flow is the lifeblood of creative ambition.&rdquo;
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-l border-t border-brand-charcoal/10">
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Gross Revenue" value={`₹${data.stats.total.toLocaleString()}`} trend="Real-time" trendUp={true} icon={DollarSign} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Settled Payouts" value={`₹${paidAmount.toLocaleString()}`} trend="Staff Cost" trendUp={false} icon={Wallet} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Pending Payouts" value={`₹${pendingAmount.toLocaleString()}`} trend="Due Soon" trendUp={false} icon={CreditCard} />
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
             {data.payments.length > 0 ? data.payments.map((p) => (
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

        {/* Enhanced Payout Ledger */}
        <div className="space-y-10">
          <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Staff Payouts</h2>
              <div className="flex gap-1 border border-brand-charcoal/10 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setPayoutFilter('all')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${payoutFilter === 'all' ? 'bg-brand-charcoal text-white' : 'text-brand-charcoal/40 hover:text-brand-charcoal'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setPayoutFilter('pending')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${payoutFilter === 'pending' ? 'bg-brand-charcoal text-white' : 'text-brand-charcoal/40 hover:text-brand-charcoal'}`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setPayoutFilter('paid')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${payoutFilter === 'paid' ? 'bg-brand-charcoal text-white' : 'text-brand-charcoal/40 hover:text-brand-charcoal'}`}
                >
                  Paid
                </button>
              </div>
            </div>
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Expense Logic</span>
          </div>
          <div className="space-y-8">
             {filteredPayouts.length > 0 ? filteredPayouts.map((p) => (
              <div key={p.id} className="flex justify-between items-center group hover:bg-brand-offwhite/50 p-4 rounded-xl transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-brand-gold" />
                    <h4 className="text-xl font-bold text-brand-charcoal tracking-tight">{p.users?.name}</h4>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">
                    {p.gigs?.clients?.name && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {p.gigs.clients.name}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString()}
                    </div>
                    <div>{p.role}</div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-3">
                  <p className="text-lg font-bold text-brand-charcoal tabular-nums">₹{Number(p.amount).toLocaleString()}</p>
                  <div className="flex gap-2">
                    {p.is_paid ? (
                      <>
                        <button 
                          onClick={() => handleTogglePaidStatus(p)}
                          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-sage/10 text-brand-sage border border-brand-sage hover:bg-brand-sage/20 transition-colors flex items-center gap-1"
                          title="Mark as Unpaid"
                        >
                          <CheckCircle className="w-3 h-3" /> Paid
                        </button>
                        <button 
                          onClick={() => setEditModal(p)}
                          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-charcoal/5 text-brand-charcoal/60 border border-brand-charcoal/10 hover:bg-brand-charcoal/10 hover:text-brand-charcoal transition-colors flex items-center gap-1"
                          title="Edit Payment"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        {p.proof_url && (
                          <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-gold/5 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold/10 transition-colors flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Proof
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setSettleModal(p)}
                          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-charcoal text-white hover:bg-brand-gold transition-colors flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" /> Pay Now
                        </button>
                        <button 
                          onClick={() => handleTogglePaidStatus(p)}
                          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1"
                          title="Mark as Paid (without proof)"
                        >
                          <XCircle className="w-3 h-3" /> Mark Paid
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm italic text-brand-charcoal/30 py-10 text-center border border-dashed border-brand-charcoal/10 uppercase tracking-widest text-[10px] font-bold">
                {payoutFilter === 'all' ? 'No payouts scheduled' : 
                 payoutFilter === 'paid' ? 'No paid payouts' : 
                 'No pending payouts'}
              </p>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mt-2">{settleModal.role} • {settleModal.gigs?.clients?.name || 'No Project'}</p>
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-bold tracking-tighter text-brand-charcoal italic">Edit Payout.</h2>
              <button onClick={() => { setEditModal(null); setEditFile(null); }} className="text-brand-charcoal/20 hover:text-brand-charcoal"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 bg-brand-offwhite border border-brand-charcoal/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Payout Details</p>
                <p className="text-xl font-bold text-brand-charcoal">{editModal.users?.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mt-2">{editModal.role} • {editModal.gigs?.clients?.name || 'No Project'}</p>
                <p className="text-2xl font-bold text-brand-gold mt-4 tabular-nums">₹{Number(editModal.amount).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4 block">Payment Status</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setEditModal({...editModal, is_paid: true})}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-xl transition-all ${editModal.is_paid ? 'bg-brand-sage/10 border-brand-sage text-brand-sage' : 'border-brand-charcoal/10 text-brand-charcoal/40 hover:border-brand-sage'}`}
                  >
                    <CheckCircle className="w-4 h-4 inline-block mr-2" /> Paid
                  </button>
                  <button 
                    onClick={() => setEditModal({...editModal, is_paid: false})}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border rounded-xl transition-all ${!editModal.is_paid ? 'bg-red-50 border-red-200 text-red-500' : 'border-brand-charcoal/10 text-brand-charcoal/40 hover:border-red-200'}`}
                  >
                    <XCircle className="w-4 h-4 inline-block mr-2" /> Unpaid
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4 block">
                  {editModal.proof_url ? 'Update Payment Proof' : 'Add Payment Proof'}
                </label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${
                    editFile ? 'border-brand-sage bg-brand-sage/5' : 'border-brand-charcoal/10 group-hover:border-brand-gold'
                  }`}>
                    {editFile ? (
                      <>
                        <Check className="w-8 h-8 text-brand-sage mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sage text-center">{editFile.name}</p>
                      </>
                    ) : editModal.proof_url ? (
                      <>
                        <ImageIcon className="w-8 h-8 text-brand-gold mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold text-center">Current proof attached</p>
                        <a href={editModal.proof_url} target="_blank" rel="noreferrer" className="text-[8px] font-bold uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-charcoal mt-2">
                          View Current Proof
                        </a>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-brand-charcoal/20 group-hover:text-brand-gold mb-2 transition-colors" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 group-hover:text-brand-charcoal">Select Image (Optional)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleUpdatePayout}
                disabled={uploading}
                className="w-full py-5 bg-brand-charcoal text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {uploading ? 'Updating...' : 'Update Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
