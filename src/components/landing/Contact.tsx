"use client"
import { useState, useRef, useEffect } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const [form, setForm] = useState({ name: '', business: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left heading reveal
      gsap.from('.contact-heading', {
        scrollTrigger: { trigger: '.contact-heading', start: 'top 80%' },
        y: 60, opacity: 0, duration: 1, ease: 'power4.out'
      })
      // Left CTA card
      gsap.from('.contact-card', {
        scrollTrigger: { trigger: '.contact-card', start: 'top 85%' },
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2
      })
      // Form fields stagger in from right
      gsap.from('.contact-field', {
        scrollTrigger: { trigger: '.contact-form', start: 'top 80%' },
        x: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out'
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.from('clients').insert({
        name: form.name,
        business: form.business,
        phone: form.phone,
        status: 'lead',
      })
      if (error) throw error
      setStatus('success')
      setForm({ name: '', business: '', phone: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section ref={sectionRef} id="contact" className="w-full flex justify-center py-32 bg-brand-offwhite border-t-4 border-brand-gold">
      <div className="w-full max-w-[1800px] px-8 md:px-16 lg:px-24 grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">

        {/* Left */}
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/50 mb-6 flex items-center gap-2">
            <span className="w-4 h-px bg-brand-gold"></span> Start a Project
          </p>
          <h2 className="contact-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-brand-charcoal leading-[1] mb-10">
            Let's Build<br />
            <span className="text-brand-gold">Together.</span>
          </h2>
          <p className="text-sm text-brand-charcoal/60 max-w-md leading-relaxed mb-12">
            Whether you need a landing page, a full digital ecosystem, or a custom app — Kal Studio delivers work that performs.
          </p>
          <div className="contact-card bg-white border border-brand-charcoal/5 p-8 max-w-sm shadow-sm">
            <h3 className="text-base font-bold mb-2">Kal Studio.</h3>
            <p className="text-xs text-brand-charcoal/60 leading-relaxed mb-6">
              A creative studio transforming bold ideas into powerful digital structures. We help modern brands build identity, impact, and growth.
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold border-b border-brand-gold pb-0.5 hover:text-brand-charcoal hover:border-brand-charcoal transition-colors">
              View Our Works <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right: Form */}
        <form onSubmit={handleSubmit} className="contact-form flex flex-col gap-0">
          {[
            { key: 'name', label: 'Your Name', placeholder: 'John Smith' },
            { key: 'business', label: 'Business Name', placeholder: 'Acme Corp' },
            { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="contact-field border-b border-brand-charcoal/15 py-6 group focus-within:border-brand-charcoal transition-colors">
              <label className="block text-[9px] uppercase font-bold tracking-widest text-brand-charcoal/40 mb-3 group-focus-within:text-brand-gold transition-colors">
                {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full bg-transparent text-lg font-medium text-brand-charcoal placeholder:text-brand-charcoal/20 focus:outline-none"
                required
              />
            </div>
          ))}

          <div className="contact-field border-b border-brand-charcoal/15 py-6 group focus-within:border-brand-charcoal transition-colors">
            <label className="block text-[9px] uppercase font-bold tracking-widest text-brand-charcoal/40 mb-3 group-focus-within:text-brand-gold transition-colors">
              Message (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about your project..."
              value={form.message}
              onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full bg-transparent text-lg font-medium text-brand-charcoal placeholder:text-brand-charcoal/20 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-10">
            {status === 'success' ? (
              <p className="text-sm font-bold text-brand-sage flex items-center gap-2">
                ✓ Message received! We'll be in touch within 24 hours.
              </p>
            ) : (
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center gap-4 bg-brand-charcoal text-brand-offwhite pl-8 pr-2 py-2 rounded-full font-bold text-sm hover:bg-black transition-colors disabled:opacity-50 group"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <>
                    Book a Call
                    <div className="w-8 h-8 bg-brand-offwhite rounded-full flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                      <ArrowUpRight className="w-4 h-4 text-brand-charcoal" />
                    </div>
                  </>
                )}
              </button>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-500 mt-4">Something went wrong. Please try again.</p>
            )}
          </div>
        </form>

      </div>
    </section>
  )
}
