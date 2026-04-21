"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Library, Plus, Trash2, ExternalLink, Loader2, Filter } from 'lucide-react'

interface Material {
  id: string
  title: string
  description: string
  url: string
  category: string
  created_at: string
}

const CATEGORIES = ['Strategy', 'Design Assets', 'Legal/Templates', 'Training']

export default function MaterialsManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', url: '', category: 'Strategy' })
  const supabase = createClient()

  const fetchMaterials = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) setMaterials(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    const { data, error } = await supabase
      .from('materials')
      .insert([formData])
      .select()
    
    if (!error && data) {
      setMaterials([data[0], ...materials])
      setFormData({ title: '', description: '', url: '', category: 'Strategy' })
      // @ts-ignore
      document.getElementById('add-modal')?.close()
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this material?")) return
    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (!error) setMaterials(materials.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Resource Hub</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Material<br />
            Manager.
          </h1>
        </div>
        <button 
          // @ts-ignore
          onClick={() => document.getElementById('add-modal')?.showModal()}
          className="flex items-center gap-3 px-8 py-4 bg-brand-charcoal text-brand-offwhite text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-32">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <div key={m.id} className="bg-white border border-brand-charcoal/10 p-8 flex flex-col justify-between group hover:border-brand-gold transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-brand-offwhite border border-brand-charcoal/5 text-brand-gold">
                    {m.category}
                  </span>
                  <button 
                    onClick={() => handleDelete(m.id)}
                    className="p-2 text-brand-charcoal/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-charcoal tracking-tight mb-2 underline decoration-brand-gold/20">{m.title}</h3>
                  <p className="text-[11px] text-brand-charcoal/60 leading-relaxed italic">{m.description}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-brand-charcoal/5 flex justify-between items-center">
                <a 
                  href={m.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal hover:text-brand-gold transition-colors"
                >
                  Open Resource <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[9px] text-brand-charcoal/20 font-mono">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-brand-charcoal/5 rounded-xl">
              <Library className="w-12 h-12 text-brand-charcoal/10 mx-auto mb-4" />
              <p className="text-sm text-brand-charcoal/30 italic">No materials uploaded yet. Start by adding your first tool.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <dialog id="add-modal" className="modal p-0 bg-transparent backdrop:bg-brand-charcoal/40 backdrop:backdrop-blur-sm">
        <div className="bg-brand-offwhite w-full max-w-md p-10 shadow-2xl border border-brand-charcoal/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold tracking-tighter text-brand-charcoal">New Material.</h3>
            <button 
              // @ts-ignore
              onClick={() => document.getElementById('add-modal')?.close()}
              className="text-brand-charcoal/40 hover:text-brand-charcoal"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Agency Strategy PDF"
                className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">URL</label>
              <input 
                type="url" 
                required
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://..."
                className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">Short Description</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly explain how this tool helps the team..."
                className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={adding}
              className="w-full py-4 bg-brand-gold text-brand-offwhite text-[11px] font-bold uppercase tracking-widest hover:bg-brand-charcoal transition-all mt-4 disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Material'}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  )
}
