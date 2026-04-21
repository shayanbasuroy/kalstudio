"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, ExternalLink, Loader2, Search, Tool } from 'lucide-react'

interface Material {
  id: string
  title: string
  description: string
  url: string
  category: string
}

const CATEGORIES = ['All', 'Strategy', 'Design Assets', 'Legal/Templates', 'Training']

export default function EmployeeMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const supabase = createClient()

  useEffect(() => {
    async function fetchMaterials() {
      setLoading(true)
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) setMaterials(data)
      setLoading(false)
    }
    fetchMaterials()
  }, [])

  const filtered = activeCategory === 'All' 
    ? materials 
    : materials.filter(m => m.category === activeCategory)

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Staff Resources</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Digital<br />
            Toolbox.
          </h1>
        </div>
        <div className="max-w-[280px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
          "The right tools aren't just an advantage; they are the foundation of our studio's craftsmanship."
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? 'bg-brand-charcoal text-brand-offwhite' 
                : 'bg-white border border-brand-charcoal/5 text-brand-charcoal/60 hover:border-brand-gold hover:text-brand-gold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-32">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((m) => (
            <div key={m.id} className="group relative bg-white border border-brand-charcoal/10 p-10 flex flex-col justify-between hover:border-brand-gold transition-all overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-12 h-12 text-brand-charcoal" />
              </div>
              
              <div className="relative space-y-6">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold mb-2 block">
                    {m.category}
                  </span>
                  <h3 className="text-2xl font-bold text-brand-charcoal tracking-tight leading-tight">{m.title}</h3>
                </div>
                
                <p className="text-xs text-brand-charcoal/60 leading-relaxed italic">
                  "{m.description || 'No description provided for this resource.'}"
                </p>
              </div>
              
              <div className="mt-12 pt-8 border-t border-brand-charcoal/5">
                <a 
                  href={m.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-3 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                >
                  Access Tool <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-brand-charcoal/5 rounded-2xl">
              <p className="text-sm text-brand-charcoal/30 italic">No resources found in the "{activeCategory}" category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
