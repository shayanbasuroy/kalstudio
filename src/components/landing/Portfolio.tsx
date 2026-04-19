"use client"
import { ArrowUpRight } from 'lucide-react'

const works = [
  {
    number: '01',
    name: 'Aura Cafe',
    category: 'Landing Page · Branding',
    year: '2025',
    bg: 'bg-[#e8e4df]',
  },
  {
    number: '02',
    name: 'Zenith Fitness',
    category: 'Multi-Page · Photography',
    year: '2025',
    bg: 'bg-[#d8d4cf]',
  },
  {
    number: '03',
    name: 'Kolkata Legal',
    category: 'Corporate Hub · SEO',
    year: '2025',
    bg: 'bg-[#2a2220]',
    light: true,
  },
]

export default function Portfolio() {
  return (
    <section className="w-full flex justify-center py-32 bg-brand-offwhite">
      <div className="w-full max-w-[1800px] px-8 md:px-16 lg:px-24">

        <div className="flex justify-between items-end mb-20">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/50 mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-brand-gold"></span> Selected Works
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-brand-charcoal">
              Our Latest<br />Projects
            </h2>
          </div>
          <a href="#contact" className="hidden md:flex items-center gap-2 text-xs font-bold text-brand-charcoal border-b border-brand-charcoal pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors">
            View All Work <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {/* Work rows — mimicking the Lumière editorial list */}
        <div className="flex flex-col">
          {works.map((work, idx) => (
            <div key={idx} className="group cursor-pointer border-t border-brand-charcoal/10 py-10 flex flex-col md:flex-row md:items-center gap-8 hover:border-brand-gold transition-colors last:border-b last:border-brand-charcoal/10">
              
              {/* Number */}
              <span className="text-[10px] font-bold text-brand-charcoal/40 tracking-widest w-8 shrink-0">
                {work.number}
              </span>

              {/* Thumbnail */}
              <div className={`w-full md:w-48 lg:w-64 aspect-video ${work.bg} shrink-0 overflow-hidden relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-2xl font-serif italic ${work.light ? 'text-white/20' : 'text-brand-charcoal/10'}`}>
                    {work.name}
                  </div>
                </div>
                {/* Gold shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-brand-gold transition-opacity duration-500"></div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-brand-charcoal group-hover:text-brand-charcoal/80 transition-colors">
                  {work.name}
                </h3>
                <p className="text-xs font-medium text-brand-charcoal/50 mt-2 tracking-wide uppercase">
                  {work.category}
                </p>
              </div>

              {/* Year + Arrow */}
              <div className="flex items-center gap-8 shrink-0">
                <span className="text-xs text-brand-charcoal/40 font-mono">{work.year}</span>
                <div className="w-10 h-10 border border-brand-charcoal/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-brand-gold group-hover:text-brand-gold transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
