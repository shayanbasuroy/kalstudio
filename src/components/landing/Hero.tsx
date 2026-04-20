"use client"
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Magnetic from '@/components/ui/Magnetic'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance Animations
      gsap.set(['.hero-kal', '.hero-studio'], { y: 120, opacity: 0, clipPath: 'inset(0 0 100% 0)' })
      gsap.set('.hero-since', { opacity: 0, x: 20 })
      gsap.set('.hero-card', { opacity: 0, y: 40, scale: 0.96 })
      gsap.set('.hero-social', { opacity: 0, x: -20 })
      gsap.set('.hero-divider-item', { opacity: 0, y: 10 })

      const tl = gsap.timeline({ delay: 0.1 })

      tl.to('.hero-kal', {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 1,
        ease: 'power4.out',
      })
      .to('.hero-studio', {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.9,
        ease: 'power4.out',
      }, '-=0.65')
      .to('.hero-since', {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.5')
      .to('.hero-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4')
      .to('.hero-social', { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.3')
      .to('.hero-divider-item', { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.2')

      // 2. Mouse Parallax for Card
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e
        const xPos = (clientX / window.innerWidth - 0.5) * 20
        const yPos = (clientY / window.innerHeight - 0.5) * 20
        
        gsap.to(cardRef.current, {
          x: xPos,
          y: yPos,
          rotateX: -yPos * 0.5,
          rotateY: xPos * 0.5,
          duration: 1.2,
          ease: 'power2.out'
        })
      }

      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="home" className="w-full flex justify-center pb-12 md:pb-20 overflow-hidden bg-brand-offwhite">
      <div className="w-full max-w-[1800px] flex flex-col items-center">
        {/* Main Editorial Block */}
        <div className="w-full px-6 md:px-16 lg:px-24 pt-8 md:pt-10 pb-12 md:pb-16 relative flex flex-col items-center md:items-start text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start overflow-hidden w-full">
            <h1 className="hero-kal text-[70px] sm:text-[100px] md:text-[180px] lg:text-[240px] font-bold tracking-tighter text-brand-charcoal leading-[0.8] mb-2 md:mb-4">
              Kal
            </h1>
            <h1 className="hero-studio text-[50px] sm:text-[70px] md:text-[120px] lg:text-[160px] font-bold tracking-tighter text-brand-gold leading-[0.8]">
              Studio©
            </h1>
          </div>

          <div className="hero-since mt-6 md:absolute md:top-10 md:right-16 lg:right-32 text-brand-charcoal/60 text-[10px] md:text-xs font-semibold tracking-wider font-mono uppercase">
            Since 2025
          </div>

          {/* Right Floating Card - Stacks on Mobile */}
          <div ref={cardRef} className="hero-card relative md:absolute right-0 md:right-16 lg:right-24 md:bottom-16 w-full md:w-80 max-w-sm mt-12 md:mt-0 group px-0 perspective-1000">
            <div className="w-full aspect-[16/9] bg-brand-charcoal rounded-lg overflow-hidden mb-6 relative shadow-2xl border border-brand-charcoal/20 transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Kal Studio</span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-gold/60"></div>
                  </div>
                </div>
                <div className="flex gap-1 items-end h-16 md:h-20">
                  {[20, 48, 32, 60, 24, 52, 68, 36, 44].map((h, i) => (
                    <div key={i} style={{height: `${h}%`}} className="flex-1 bg-brand-gold opacity-90 rounded-sm"></div>
                  ))}
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-bold text-white/30 lowercase font-mono">/ mission architecture</span>
                  <span className="text-brand-gold text-[10px] font-bold tracking-tighter">EST. 2025</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] md:text-[12px] leading-relaxed text-brand-charcoal/70 mb-6 font-medium italic md:not-italic">
              We specialize in custom web architecture, multi-page funnel designs, and conversion strategies that help businesses scale.
            </p>
            <div className="flex justify-center md:justify-start">
              <Magnetic strength={0.3}>
                <Link href="#contact" className="inline-flex items-center gap-3 bg-brand-charcoal text-brand-offwhite pl-6 pr-2 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-brand-gold transition-all group scale-110 md:scale-100">
                  Book a Strategy Call
                  <div className="w-7 h-7 bg-brand-offwhite rounded-full flex items-center justify-center group-hover:bg-brand-charcoal transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-charcoal group-hover:text-white" />
                  </div>
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* Left Social Links */}
          <div className="mt-16 md:mt-32 flex flex-row md:flex-col gap-6 md:gap-2">
            {['Instagram', 'Twitter', 'LinkedIn'].map((link) => (
              <a key={link} href="#" className="hero-social flex items-center gap-2 text-[10px] font-bold text-brand-charcoal/40 hover:text-brand-gold tracking-widest uppercase transition-colors">
                <span className="w-1 h-1 bg-brand-gold rounded-full"></span>
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Divider Strip */}
        <div className="w-full px-6 md:px-16 lg:px-24 py-8 border-y border-brand-charcoal/10 flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center gap-4 text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-brand-charcoal/80">
           {['Digital Architecture', 'Web Design & Development', 'Funnel Optimization', 'Photography'].map((item, i) => (
             <span key={i} className={`hero-divider-item flex items-center gap-3 ${i > 1 ? 'hidden sm:flex' : 'flex'}`}>
               {i > 0 && <span className="hidden md:block w-1.5 h-1.5 bg-brand-gold/30 rounded-full"></span>}
               {item}
             </span>
           ))}
        </div>
      </div>
    </section>
  )
}

