"use client"
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Phone, Building2, UserPlus, Loader2, AlertCircle } from 'lucide-react'

interface Client {
  id: string
  name: string
  business: string
  phone: string
  status: 'lead' | 'active' | 'lost'
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', business: '', phone: '', status: 'lead' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'active' | 'lost'>('all')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  const supabase = createClient()

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setClients(data as Client[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClients()
  }, [fetchClients])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        setError("Authenication session missing. Please re-login.")
        setSaving(false)
        return
    }

    const { error: insertError } = await supabase
      .from('clients')
      .insert([{ ...newClient, added_by: user.id }])

    if (insertError) {
      setError(insertError.message)
    } else {
      setShowAddModal(false)
      setNewClient({ name: '', business: '', phone: '', status: 'lead' })
      fetchClients()
    }
    setSaving(false)
  }

  const handleUpdateClient = async (clientId: string, status: Client['status']) => {
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('clients')
      .update({ status })
      .eq('id', clientId)
    
    if (error) {
      setError(error.message)
    } else {
      setEditingClient(null)
      fetchClients()
    }
    setSaving(false)
  }

  const filteredClients = clients.filter(c => 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.business.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || c.status === statusFilter)
  )

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Relations</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Client<br />
            Database.
          </h1>
        </div>
        <button 
          onClick={() => { setError(null); setShowAddModal(true); }}
          className="flex items-center gap-3 bg-brand-charcoal text-brand-offwhite px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10"
        >
          <Plus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-6 border border-brand-charcoal/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/30" />
          <input 
            type="text" 
            placeholder="Search database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-offwhite border-none text-sm focus:ring-1 focus:ring-brand-gold outline-none"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <select 
             value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-brand-charcoal/10 text-[10px] font-bold uppercase tracking-widest hover:border-brand-gold transition-colors bg-white"
           >
             <option value="all">All Status</option>
             <option value="lead">Lead</option>
             <option value="active">Active</option>
             <option value="lost">Lost</option>
           </select>
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 self-center">
            {filteredClients.length} Records Found
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="grid gap-px bg-brand-charcoal/10 border border-brand-charcoal/10 overflow-hidden">
        {loading ? (
          <div className="bg-white p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white p-8 group hover:bg-brand-offwhite transition-colors grid md:grid-cols-[1.5fr_1fr_1.5fr_1fr] items-center gap-8">
              <div>
                <h3 className="text-xl font-bold text-brand-charcoal tracking-tight group-hover:text-brand-gold transition-colors">{client.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mt-1">{client.business}</p>
              </div>
              
              <div className="flex flex-col gap-2 text-[11px] text-brand-charcoal/60">
                <div className="flex items-center gap-2"><Phone className="w-3 h-3 opacity-40" /> {client.phone || 'N/A'}</div>
              </div>

              <div>
                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 border ${
                  client.status === 'active' ? 'border-brand-gold text-brand-gold' : 
                  client.status === 'lost' ? 'border-red-200 text-red-400' : 
                  'border-brand-charcoal/20 text-brand-charcoal/40'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="text-right">
                 <button onClick={() => setEditingClient(client)} className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/20 hover:text-brand-charcoal transition-colors">
                   Edit Profile
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-32 text-center">
            <Building2 className="w-12 h-12 text-brand-charcoal/5 mx-auto mb-6" />
            <p className="text-sm text-brand-charcoal/30 italic">No clients found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold tracking-tighter text-brand-charcoal mb-8 italic">New Entry.</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 flex items-center gap-3 text-red-500 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}

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
                    placeholder="e.g. Hospitality"
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
                  className="flex-1 py-4 bg-brand-charcoal text-brand-offwhite rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-charcoal/10"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-4 h-4" />} Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold tracking-tighter text-brand-charcoal mb-8 italic">Update Status.</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 flex items-center gap-3 text-red-500 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Client</p>
                <p className="text-xl font-bold text-brand-charcoal">{editingClient.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{editingClient.business}</p>
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2 block">Status</label>
                <select 
                  value={editingClient.status}
                  onChange={(e) => setEditingClient({...editingClient, status: e.target.value as Client['status']})}
                  className="w-full px-4 py-3 bg-brand-offwhite border-none rounded-xl text-sm focus:ring-1 focus:ring-brand-gold outline-none"
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => setEditingClient(null)}
                  className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpdateClient(editingClient.id, editingClient.status)}
                  disabled={saving}
                  className="flex-1 py-4 bg-brand-charcoal text-brand-offwhite rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-charcoal/10"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
