"use client"
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Library, Plus, Trash2, ExternalLink, Loader2, FileText, Upload, X, Search, Edit } from 'lucide-react'

interface Material {
  id: string
  title: string
  description: string
  url: string
  category: string
  audience: 'all' | 'sales' | 'developer'
  created_at: string
}

const CATEGORIES = ['Strategy', 'Design Assets', 'Legal/Templates', 'Training']
const AUDIENCE_OPTIONS = ['all', 'sales', 'developer']

export default function MaterialsManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [adding, setAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeAudience, setActiveAudience] = useState("all")
  const [activeCategory, setActiveCategory] = useState("All")
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [urlMode, setUrlMode] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', url: '', category: 'Strategy', audience: 'all' })
  const supabase = createClient()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      setError('Failed to load materials: ' + error.message)
    } else if (data) {
      setMaterials(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {

    fetchMaterials()
  }, [fetchMaterials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)

    let url = formData.url

    if (file) {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `materials/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
       const { error: uploadError } = await supabase.storage
         .from('materials')
         .upload(fileName, file)

      if (uploadError) {
        alert('Failed to upload file: ' + uploadError.message)
        setAdding(false)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(fileName)

      url = publicUrl
      setUploading(false)
    }

    let data, error
    if (editingMaterial) {
      // Update existing material
      ({ data, error } = await supabase
        .from('materials')
        .update({ title: formData.title, description: formData.description, url, category: formData.category, audience: formData.audience })
        .eq('id', editingMaterial.id)
        .select())
    } else {
      // Insert new material
      ({ data, error } = await supabase
        .from('materials')
        .insert([{ title: formData.title, description: formData.description, url, category: formData.category, audience: formData.audience }])
        .select())
    }
    
    if (!error && data) {
      if (editingMaterial) {
        // Replace the updated material in the list
        setMaterials(materials.map(m => m.id === editingMaterial.id ? data[0] : m))
        setEditingMaterial(null)
      } else {
        setMaterials([data[0], ...materials])
      }
      setFormData({ title: '', description: '', url: '', category: 'Strategy', audience: 'all' })
      setFile(null)
      setUrlMode(false)
      dialogRef.current?.close()
    } else {
      const errMsg = 'Failed to save material: ' + (error?.message || 'Unknown error')
      setError(errMsg)
      alert(errMsg)
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this material?")) return
    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (error) {
      setError('Failed to delete material: ' + error.message)
      alert('Failed to delete material: ' + error.message)
    } else {
      setMaterials(materials.filter(m => m.id !== id))
    }
  }

  const isPdf = (url: string) => url.toLowerCase().endsWith('.pdf')

  const filtered = materials.filter((m) => {
    // Category filter
    if (activeCategory !== "All" && m.category !== activeCategory) return false;
    
    // Audience filter
    if (activeAudience !== "all" && m.audience !== activeAudience) return false;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const inTitle = m.title.toLowerCase().includes(query);
      const inDesc = m.description.toLowerCase().includes(query);
      if (!inTitle && !inDesc) return false;
    }
    
    return true;
  });

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
          onClick={() => dialogRef.current?.showModal()}
          className="flex items-center gap-3 px-8 py-4 bg-brand-charcoal text-brand-offwhite text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials by title or description..."
            className="w-full bg-white border border-brand-charcoal/10 pl-10 pr-10 py-3 text-sm text-brand-charcoal placeholder:text-brand-charcoal/30 focus:border-brand-gold outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-brand-charcoal/30 hover:text-brand-charcoal transition-colors" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-6">
          {/* Audience Filter */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60 mb-2">Filter by Role</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'sales', 'developer'].map((aud) => (
                <button
                  key={aud}
                  onClick={() => setActiveAudience(aud)}
                  className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                    activeAudience === aud
                      ? "bg-brand-charcoal text-brand-offwhite"
                      : "bg-white border border-brand-charcoal/5 text-brand-charcoal/60 hover:border-brand-gold hover:text-brand-gold"
                  }`}
                >
                  {aud === 'all' ? 'All' : aud === 'sales' ? 'Sales' : 'Developer'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60 mb-2">Filter by Category</p>
            <div className="flex flex-wrap gap-2">
              {['All', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat
                      ? "bg-brand-charcoal text-brand-offwhite"
                      : "bg-white border border-brand-charcoal/5 text-brand-charcoal/60 hover:border-brand-gold hover:text-brand-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-32">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map((m) => (
            <div key={m.id} className="bg-white border border-brand-charcoal/10 p-8 flex flex-col justify-between group hover:border-brand-gold transition-all">
              <div className="space-y-4">
                 <div className="flex justify-between items-start">
                   <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-brand-offwhite border border-brand-charcoal/5 text-brand-gold">
                     {m.category}
                   </span>
                   <div className="flex gap-1">
                     <button 
                       onClick={() => {
                         setEditingMaterial(m)
                         setFormData({
                           title: m.title,
                           description: m.description,
                           url: m.url,
                           category: m.category,
                           audience: m.audience
                         })
                         setUrlMode(!m.url.toLowerCase().endsWith('.pdf'))
                         setFile(null)
                         dialogRef.current?.showModal()
                       }}
                       className="p-2 text-brand-charcoal/10 hover:text-brand-gold transition-colors"
                     >
                       <Edit className="w-3.5 h-3.5" />
                     </button>
                     <button 
                       onClick={() => handleDelete(m.id)}
                       className="p-2 text-brand-charcoal/10 hover:text-red-500 transition-colors"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-charcoal tracking-tight mb-2 underline decoration-brand-gold/20 flex items-center gap-2">
                    {m.title}
                    {isPdf(m.url) && <FileText className="w-4 h-4 text-brand-gold shrink-0" />}
                  </h3>
                  <p className="text-[11px] text-brand-charcoal/60 leading-relaxed italic">{m.description}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-brand-charcoal/5 flex flex-col gap-3">
                {isPdf(m.url) ? (
                  <>
                    <a 
                      href={m.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal hover:text-brand-gold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> View PDF <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <div className="border border-brand-charcoal/5 rounded-lg overflow-hidden">
                      <iframe
                        src={m.url}
                        title={m.title}
                        className="w-full h-40"
                        style={{ border: 'none' }}
                      />
                    </div>
                  </>
                ) : (
                  <a 
                    href={m.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal hover:text-brand-gold transition-colors"
                  >
                    Open Resource <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <span className="text-[9px] text-brand-charcoal/20 font-mono">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
           {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-brand-charcoal/5 rounded-xl">
              <Library className="w-12 h-12 text-brand-charcoal/10 mx-auto mb-4" />
              <p className="text-sm text-brand-charcoal/30 italic">No materials uploaded yet. Start by adding your first tool.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <dialog ref={dialogRef} className="modal p-0 bg-transparent backdrop:bg-brand-charcoal/40 backdrop:backdrop-blur-sm">
        <div className="bg-brand-offwhite w-full max-w-md p-10 shadow-2xl border border-brand-charcoal/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold tracking-tighter text-brand-charcoal">{editingMaterial ? 'Edit Material.' : 'New Material.'}</h3>
            <button 
               onClick={() => { dialogRef.current?.close(); setFile(null); setUrlMode(false); setEditingMaterial(null); setFormData({ title: '', description: '', url: '', category: 'Strategy', audience: 'all' }) }}
              className="text-brand-charcoal/40 hover:text-brand-charcoal"
            >
              <X className="w-5 h-5" />
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

            {/* Upload / URL toggle */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setUrlMode(false); setFormData({...formData, url: ''}) }}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${!urlMode ? 'bg-brand-charcoal text-white' : 'bg-white border border-brand-charcoal/10 text-brand-charcoal/60'}`}
                >
                  <Upload className="w-3 h-3 inline mr-1.5" />
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => { setUrlMode(true); setFile(null) }}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${urlMode ? 'bg-brand-charcoal text-white' : 'bg-white border border-brand-charcoal/10 text-brand-charcoal/60'}`}
                >
                  <ExternalLink className="w-3 h-3 inline mr-1.5" />
                  External Link
                </button>
              </div>

              {urlMode ? (
                <input 
                  type="url" 
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                />
              ) : (
                <div className="border-2 border-dashed border-brand-charcoal/10 p-6 text-center hover:border-brand-gold transition-colors">
                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-brand-gold" />
                        <span className="text-sm font-medium text-brand-charcoal truncate max-w-[200px]">{file.name}</span>
                        <span className="text-[10px] text-brand-charcoal/40">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-brand-charcoal/20" />
                      <span className="text-[11px] text-brand-charcoal/40 font-medium">Click to upload a PDF</span>
                      <span className="text-[9px] text-brand-charcoal/20">PDF files only</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
              )}
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">Audience</label>
              <select 
                value={formData.audience}
                onChange={(e) => setFormData({...formData, audience: e.target.value as 'all' | 'sales' | 'developer'})}
                className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
              >
                {AUDIENCE_OPTIONS.map(aud => <option key={aud} value={aud}>{aud === 'all' ? 'All' : aud === 'sales' ? 'Sales' : 'Developer'}</option>)}
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
              disabled={adding || uploading}
              className="w-full py-4 bg-brand-gold text-brand-offwhite text-[11px] font-bold uppercase tracking-widest hover:bg-brand-charcoal transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                 editingMaterial ? 'Update Material' : 'Save Material'
              )}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  )
}
