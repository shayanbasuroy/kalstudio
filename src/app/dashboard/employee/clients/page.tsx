"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Building2, UserPlus, Loader2 } from 'lucide-react'

export default function EmployeeCRM() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', business: '', phone: '', status: 'lead' })
  const [saving, setSaving] = useState(false)
  
  const supabase = createClient()

  const fetchMyClients = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('added_by', user?.id)
      .order('created_at', { ascending: false })

    if (data) setClients(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMyClients()
  }, [])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('clients')
      .insert([{ ...newClient, added_by: user?.id }])

    if (!error) {
      setShowAddModal(false)
      setNewClient({ name: '', business: '', phone: '', status: 'lead' })
      fetchMyClients()
    }
    setSaving(false)
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">CRM</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Lead<br />
            Manager.
          </h1>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 bg-brand-charcoal text-brand-offwhite px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10"
        >
          <Plus className="w-4 h-4" /> Add New Lead
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-6 border border-brand-charcoal/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/30" />
          <input 
            type="text" 
            placeholder="Search my leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-offwhite border-none text-sm focus:ring-1 focus:ring-brand-gold outline-none"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 self-center">
            {filteredClients.length} Your Registered Leads
        </div>
      </div>

      {/* Main List */}
      <div className="grid gap-px bg-brand-charcoal/10 border border-brand-charcoal/10 overflow-hidden">
        {loading ? (
          <div className="bg-white p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white p-8 group hover:bg-brand-offwhite transition-colors flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-brand-charcoal tracking-tight group-hover:text-brand-gold transition-colors">{client.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mt-1">{client.business}</p>
              </div>
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-brand-charcoal/20 text-brand-charcoal/40`}>
                  {client.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-32 text-center">
            <Building2 className="w-12 h-12 text-brand-charcoal/5 mx-auto mb-6" />
            <p className="text-sm text-brand-charcoal/30 italic">You haven't added any leads yet.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold tracking-tighter text-brand-charcoal mb-8 italic">New Lead.</h2>
            <form onSubmit={handleAddClient} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2 block">Client / Business Name</label>
                  <input 
                    required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-4 py-3 bg-brand-offwhite border-none rounded-xl text-sm focus:ring-1 focus:ring-brand-gold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2 block">Category</label>
                  <input 
                    required type="text" value={newClient.business} onChange={e => setNewClient({...newClient, business: e.target.value})}
                    placeholder="e.g. Real Estate"
                    className="w-full px-4 py-3 bg-brand-offwhite border-none rounded-xl text-sm focus:ring-1 focus:ring-brand-gold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2 block">Phone</label>
                  <input 
                    type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-brand-offwhite border-none rounded-xl text-sm focus:ring-1 focus:ring-brand-gold outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={saving}
                  className="flex-1 py-4 bg-brand-charcoal text-brand-offwhite rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-4 h-4" />} Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
