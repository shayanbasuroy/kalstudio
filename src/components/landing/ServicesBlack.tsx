"use client"
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const servicesList = [
  {
    title: "Digital Architecture",
    points: [
      "Grow your online presence organically",
      "Engage with your audience regularly",
      "Utilize relevant aesthetic layouts",
      "Robust backend integrations"
    ],
  },
  {
    title: "Web Design & Development",
    points: [
      "Responsive websites",
      "Fast-loading pages",
      "Clean, modern layouts",
      "SEO-friendly structure"
    ],
  },
  {
    title: "UI/UX Design",
    points: [
      "User-friendly interfaces",
      "Intuitive navigation",
      "Mobile-first design"
    ],
  }
]

export default function ServicesBlack() {
  const sectionRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Existing Reveal Animations
      gsap.from('.services-title', {
        scrollTrigger: { trigger: '.services-title', start: 'top 80%' },
        x: -60, opacity: 0, duration: 1, ease: 'power4.out'
      })

      gsap.from('.service-row', {
        scrollTrigger: { trigger: '.services-rows', start: 'top 75%' },
        y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
      })

      // 2. Spotlight Logic
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e
        const rect = sectionRef.current?.getBoundingClientRect()
        if (rect) {
          const x = clientX - rect.left
          const y = clientY - rect.top
          gsap.to(spotlightRef.current, {
            x,
            y,
            duration: 0.4,
            ease: 'power2.out'
          })
        }
      }

      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="services" className="w-full bg-brand-charcoal text-brand-offwhite py-20 md:py-32 flex justify-center border-t-4 border-brand-gold overflow-hidden relative">
      {/* Interactive Spotlight Glow */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/10 blur-[120px] rounded-full z-0 opacity-0 md:opacity-100"
      ></div>

      <div className="w-full max-w-[1800px] px-6 md:px-16 lg:px-24 grid lg:grid-cols-[1fr_2fr] gap-12 md:gap-16 relative z-10">
        
        {/* Left Side: Sticky Title */}
        <div className="services-title lg:sticky lg:top-32 h-fit text-center lg:text-left">
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-gold mb-6 flex items-center justify-center lg:justify-start gap-4">
            <span className="w-8 h-px bg-brand-gold/30"></span> Our Expertise
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-8 lg:mb-0">
            Digital Evolution <br />for Modern Brands.
          </h2>
        </div>

        {/* Right Side: Service Rows */}
        <div className="services-rows flex flex-col gap-10 md:gap-16">
          {servicesList.map((service, idx) => (
            <div key={idx} className="service-row relative pb-10 md:pb-16 border-b border-brand-offwhite/5 group last:border-b-0">
              
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                 <div className="w-2 md:w-3 h-2 md:h-3 bg-brand-gold rounded-full md:rounded-none transition-transform group-hover:scale-125"></div>
                 <h3 className="text-xl md:text-4xl font-bold tracking-tight">{service.title}</h3>
              </div>

              <ul className="grid sm:grid-cols-2 gap-4 md:gap-6">
                {service.points.map((point, pIdx) => (
                  <li key={pIdx} className="service-bullet flex items-start gap-3 text-[11px] md:text-sm text-brand-offwhite/40 font-medium leading-relaxed hover:text-brand-offwhite transition-colors duration-300">
                    <span className="w-1.5 h-1.5 border border-brand-gold/50 rounded-full mt-1 shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
