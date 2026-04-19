"use client"
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial hidden states
      gsap.set(['.hero-kal', '.hero-studio'], { y: 120, opacity: 0, clipPath: 'inset(0 0 100% 0)' })
      gsap.set('.hero-since', { opacity: 0, x: 20 })
      gsap.set('.hero-card', { opacity: 0, y: 40, scale: 0.96 })
      gsap.set('.hero-social', { opacity: 0, x: -20 })
      gsap.set('.hero-divider-item', { opacity: 0, y: 10 })

      const tl = gsap.timeline({ delay: 0.1 })

      // 1. Slam in "Kal" with clip reveal
      tl.to('.hero-kal', {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 1,
        ease: 'power4.out',
      })
      // 2. "Studio©" follows slightly staggered
      .to('.hero-studio', {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.9,
        ease: 'power4.out',
      }, '-=0.65')
      // 3. Since tag fades in
      .to('.hero-since', {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.5')
      // 4. Card slides up
      .to('.hero-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4')
      // 5. Social links stagger in
      .to('.hero-social', {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.3')
      // 6. Divider items fade in
      .to('.hero-divider-item', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      }, '-=0.2')

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full flex justify-center pb-20 overflow-hidden">
      <div className="w-full max-w-[1800px] flex flex-col items-center">
        {/* Main Editorial Block */}
        <div className="w-full px-8 md:px-16 lg:px-24 pt-10 pb-16 relative">
          
          <div className="flex flex-col overflow-hidden">
            <h1 className="hero-kal text-[120px] md:text-[180px] lg:text-[240px] font-bold tracking-tighter text-brand-charcoal leading-[0.8] mb-4">
              Kal
            </h1>
            <h1 className="hero-studio text-[80px] md:text-[120px] lg:text-[160px] font-bold tracking-tighter text-brand-gold leading-[0.8]">
              Studio©
            </h1>
          </div>

          <div className="hero-since absolute top-10 right-16 lg:right-32 text-brand-charcoal/60 text-xs font-semibold tracking-wider font-mono">
            Since 2025
          </div>

          {/* Right Floating Card */}
          <div className="hero-card absolute right-8 md:right-16 lg:right-24 bottom-16 w-64 md:w-80 group">
            <div className="w-full aspect-[16/9] bg-brand-charcoal rounded-lg overflow-hidden mb-4 relative shadow-lg border border-brand-charcoal/20">
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Kal Studio</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                    <div className="w-2 h-2 rounded-full bg-brand-gold/60"></div>
                  </div>
                </div>
                <div className="flex gap-1 items-end">
                  {[20, 38, 28, 44, 16, 36, 48, 24, 32].map((h, i) => (
                    <div key={i} style={{height: `${h}px`}} className="flex-1 bg-brand-gold opacity-90 rounded-sm"></div>
                  ))}
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-bold text-white/30">Digital Performance</span>
                  <span className="text-brand-gold text-[9px] font-bold tracking-wider">2025</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-brand-charcoal/70 mb-4 font-medium">
              We specialize in custom web architecture, multi-page funnel designs, and conversion strategies that help businesses grow online.
            </p>
            <Link href="#contact" className="inline-flex items-center gap-3 bg-brand-charcoal text-brand-offwhite pl-6 pr-2 py-2 rounded-full font-bold text-sm hover:bg-black transition-colors group">
              Book a Call
              <div className="w-7 h-7 bg-brand-offwhite rounded-full flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 text-brand-charcoal" />
              </div>
            </Link>
          </div>

          {/* Left Social Links */}
          <div className="mt-32 flex flex-col gap-2">
            {['Instagram', 'Twitter', 'LinkedIn'].map((link) => (
              <a key={link} href="#" className="hero-social flex items-center gap-2 text-[11px] font-bold text-brand-charcoal/80 hover:text-brand-charcoal tracking-wide">
                <span className="w-1 h-1 bg-brand-gold"></span>
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Divider Strip */}
        <div className="w-full px-8 md:px-16 lg:px-24 py-8 border-y border-brand-charcoal/10 flex justify-between items-center text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-brand-charcoal/80">
           {['Digital Architecture', 'Web Design & Development', 'Funnel Optimization', 'Photography'].map((item, i) => (
             <span key={i} className={`hero-divider-item ${i === 3 ? 'hidden md:block' : ''}`}>{item}</span>
           ))}
        </div>

      </div>
    </section>
  )
}
