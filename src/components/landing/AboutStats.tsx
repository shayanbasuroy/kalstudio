"use client"
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function AboutStats() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-mission', {
        scrollTrigger: { trigger: '.about-mission', start: 'top 80%' },
        y: 60, opacity: 0, duration: 0.9, ease: 'power3.out'
      })
      gsap.from('.about-craft-title', {
        scrollTrigger: { trigger: '.about-craft-title', start: 'top 80%' },
        y: 60, opacity: 0, duration: 1, ease: 'power4.out'
      })
      gsap.from('.about-card', {
        scrollTrigger: { trigger: '.about-card', start: 'top 85%' },
        y: 40, opacity: 0, x: -30, duration: 0.9, ease: 'power3.out', delay: 0.2
      })
      gsap.from('.about-expertise-text', {
        scrollTrigger: { trigger: '.about-expertise-text', start: 'top 80%' },
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out'
      })
      gsap.from('.about-stat', {
        scrollTrigger: { trigger: '.about-stats-grid', start: 'top 80%' },
        y: 40, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out'
      })

      // Number counters
      const counters = [
        { el: '.counter-projects', target: 10 },
        { el: '.counter-years', target: 1 },
      ]
      counters.forEach(({ el, target }) => {
        const element = document.querySelector(el)
        if (!element) return
        const obj = { val: 0 }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate() {
                element.textContent = Math.round(obj.val).toString()
              }
            })
          },
          once: true
        })
      })

      gsap.from('.about-partner', {
        scrollTrigger: { trigger: '.about-partners', start: 'top 85%' },
        y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="w-full flex justify-center py-24 bg-brand-offwhite">
      <div className="w-full max-w-[1800px] px-8 md:px-16 lg:px-24">
        
        {/* Top Mission / Craft Section */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-32 items-start">
          
          {/* Left: Mission */}
          <div className="about-mission relative">
            <h3 className="text-sm font-bold text-brand-charcoal mb-4">Our Mission</h3>
            <p className="text-xs text-brand-charcoal/60 max-w-sm mb-8 leading-relaxed">
              Our goal is to create work that looks beautiful, performs effectively, and leaves a lasting impact.
            </p>
            <div className="w-full max-w-md aspect-square bg-brand-offwhite relative rounded border border-brand-charcoal/10 overflow-hidden">
              {/* Arch shape */}
              <div className="absolute inset-0 p-8 flex items-end justify-center pb-0 overflow-hidden">
                <div className="w-48 h-48 bg-brand-charcoal rounded-t-full shadow-2xl relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-8 bg-brand-gold blur-xl opacity-50"></div>
                </div>
              </div>
              {/* Quote overlay on the image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-charcoal/60 to-transparent">
                <p className="text-brand-offwhite text-xs font-medium italic leading-relaxed">
                  "We don't just build websites — we build digital identities."
                </p>
              </div>
            </div>
          </div>

          {/* Right: We Craft... */}
          <div className="lg:pl-12">
            <h2 className="about-craft-title text-5xl md:text-6xl font-bold tracking-tighter text-brand-charcoal mb-12">
              We Craft Digital <br />Experiences
            </h2>
            <div className="about-card bg-brand-offwhite p-6 max-w-md relative border border-brand-charcoal/10">
              <div className="bg-white p-10 shadow-md border border-brand-charcoal/5 relative z-10 -ml-12 min-h-[250px] flex flex-col justify-between">
                <h3 className="text-xl md:text-2xl font-bold text-brand-charcoal leading-snug">
                  Helping brands grow through creativity, strategy, and innovative digital solutions.
                </h3>
                <span className="text-[10px] text-brand-charcoal/50 font-bold uppercase tracking-wider mt-8">
                  Since 2025
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section — improved layout */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-32 items-center">
          
          <div className="about-expertise-text">
            <h3 className="text-sm font-bold text-brand-charcoal mb-6">Proven Expertise</h3>
            <p className="text-2xl md:text-3xl font-medium text-brand-charcoal leading-tight max-w-lg">
              With years of experience working across <span className="font-bold">global brands,</span> and creative projects, our team delivered successful digital solutions.
            </p>
          </div>

          {/* Stat blocks — larger, clearly structured */}
          <div className="about-stats-grid grid grid-cols-2 gap-0 border border-brand-charcoal/10">
            <div className="about-stat p-8 md:p-12 border-r border-brand-charcoal/10">
              <div className="text-7xl md:text-9xl font-bold tracking-tighter text-brand-charcoal leading-none mb-2">
                <span className="counter-projects">10</span>
              </div>
              <div className="text-3xl font-bold text-brand-gold mb-4">+</div>
              <h4 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-2">Projects Delivered</h4>
              <p className="text-[11px] text-brand-charcoal/50 leading-relaxed">
                Seasoned team bringing strategy, design, and development expertise.
              </p>
            </div>
            <div className="about-stat p-8 md:p-12">
              <div className="text-7xl md:text-9xl font-bold tracking-tighter text-brand-charcoal leading-none mb-2">
                <span className="counter-years">1</span>
              </div>
              <div className="text-3xl font-bold text-brand-gold mb-4">+</div>
              <h4 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-2">Years of Excellence</h4>
              <p className="text-[11px] text-brand-charcoal/50 leading-relaxed">
                Successfully delivered diverse digital projects for clients worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Partners — improved with line separator */}
        <div className="about-partners w-full">
          <div className="flex items-center gap-6 mb-10">
            <span className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest whitespace-nowrap">Our Trusted Partners</span>
            <div className="flex-1 h-px bg-brand-charcoal/10"></div>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-8">
             {['Google', 'Vercel', 'Supabase', 'Stripe', 'Figma'].map((partner, i) => (
                <div key={i} className="about-partner group flex items-center gap-3 cursor-default">
                  <span className="w-1.5 h-1.5 bg-brand-gold/60 group-hover:bg-brand-gold rounded-full transition-colors"></span>
                  <span className="text-sm font-bold tracking-wide text-brand-charcoal/40 group-hover:text-brand-charcoal/70 transition-colors">{partner}</span>
                </div>
             ))}
          </div>
        </div>

      </div>
    </section>
  )
}
