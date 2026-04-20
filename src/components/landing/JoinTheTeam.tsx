"use client"
import Link from 'next/link'
import { ArrowUpRight, Sparkles, Zap, Trophy, Users } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Magnetic from '@/components/ui/Magnetic'

gsap.registerPlugin(ScrollTrigger)

export default function JoinTheTeam() {
  const sectionRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance
      gsap.from('.recruit-title', {
        scrollTrigger: { trigger: '.recruit-title', start: 'top 85%' },
        y: 60, opacity: 0, duration: 1, ease: 'power4.out'
      })

      // 2. Mouse Tracking Spotlight for the dark banner
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e
        const rect = sectionRef.current?.getBoundingClientRect()
        if (rect) {
          const x = clientX - rect.left
          const y = clientY - rect.top
          gsap.to(spotlightRef.current, {
            x,
            y,
            duration: 0.6,
            ease: 'power2.out'
          })
        }
      }

      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const benefits = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Elite Culture",
      desc: "Work with the top 1% of creative and technical talent in a high-performance environment."
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Rapid Growth",
      desc: "No corporate ladder. Your impact defines your path. Speed is our second name."
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Global Projects",
      desc: "Build digital architecture for international brands and high-scale startups."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Mission Driven",
      desc: "We don't just 'work' — we ship digital products that set new industry standards."
    }
  ]

  return (
    <section ref={sectionRef} className="w-full bg-brand-offwhite py-12 md:py-20 flex justify-center overflow-hidden border-b border-brand-charcoal/5 relative">
      <div className="w-full max-w-[1800px] px-6 md:px-16 lg:px-24">
        
        <div className="recruit-cta flex flex-col lg:flex-row items-center justify-between p-8 md:p-16 bg-brand-charcoal rounded-[32px] md:rounded-[48px] relative overflow-hidden group">
          
          {/* Interactive Spotlight Glow */}
          <div 
            ref={spotlightRef}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/10 blur-[100px] rounded-full z-0 opacity-0 md:opacity-100"
          ></div>

          <div className="relative z-10 text-center lg:text-left mb-10 lg:mb-0 max-w-2xl">
            <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-brand-gold mb-4">Elite Recruitment</p>
            <h3 className="recruit-title text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight mb-6">
              Work With<br />The Elite.
            </h3>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-8 opacity-40">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-brand-gold">{b.icon}</div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white">{b.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="recruit-cta-btn relative z-10 flex flex-col items-center lg:items-end gap-6 text-center lg:text-right">
            <p className="text-[11px] text-white/40 max-w-xs leading-relaxed font-medium uppercase tracking-widest hidden md:block">
              We hunt for elite sales closers and fullstack developers.
            </p>
            <Magnetic strength={0.3}>
              <Link 
                href="/signup" 
                className="flex items-center gap-4 bg-brand-gold text-brand-offwhite px-10 md:px-12 py-4 md:py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-brand-charcoal transition-all shadow-2xl group/btn"
              >
                Apply Now <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </Link>
            </Magnetic>
          </div>
        </div>

      </div>
    </section>
  )
}

