"use client"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact Us', href: '#contact' },
  ]

  return (
    <nav className="sticky top-0 z-[100] w-full bg-brand-offwhite/80 backdrop-blur-md border-b border-brand-charcoal/5">
      <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between px-6 md:px-16 lg:px-24 py-4 md:py-5">
        <Link href="/" className="flex items-center gap-3 md:gap-4 z-[110]">
          <Image src="/logo-icon.png" alt="Kal Studio Icon" width={60} height={60} className="w-12 md:w-20 h-12 md:h-20 object-contain" />
          <Image src="/logo-text.png" alt="Kal Studio" width={220} height={60} className="w-auto h-12 md:h-16 object-contain" />
        </Link>

        <div className="flex items-center gap-10">
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-brand-charcoal">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="hover:text-brand-gold transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="z-[110] w-10 md:w-12 h-10 md:h-12 bg-brand-gold flex items-center justify-center hover:bg-brand-charcoal transition-colors rounded-full md:rounded-none"
          >
            {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-brand-offwhite z-[105] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center gap-8 text-center">
            {navLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-charcoal hover:text-brand-gold transition-colors"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {link.name}.
              </Link>
            ))}
            <Link 
              href="/signup" 
              onClick={() => setIsOpen(false)}
              className="mt-8 px-10 py-4 bg-brand-gold text-brand-offwhite text-[11px] font-bold uppercase tracking-widest hover:bg-brand-charcoal transition-all"
            >
              Join the Team
            </Link>
          </div>
          
          <div className="absolute bottom-12 text-[10px] uppercase font-bold tracking-[0.3em] text-brand-charcoal/20">
            Kal Studio © 2025
          </div>
        </div>
      )}
    </nav>
  )
}

