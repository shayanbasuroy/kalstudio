"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-offwhite/80 backdrop-blur-md border-b border-brand-charcoal/5">
      <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between px-8 md:px-16 lg:px-24 py-5">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo-icon.png" alt="Kal Studio Icon" width={80} height={80} className="w-20 h-20 object-contain" />
        <Image src="/logo-text.png" alt="Kal Studio" width={280} height={80} className="w-auto h-16 object-contain" />
      </Link>

      <div className="flex items-center gap-10">
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-brand-charcoal">
          <Link href="#home" className="hover:text-brand-gold transition-colors text-brand-gold">Home</Link>
          <Link href="#about" className="hover:text-brand-gold transition-colors">About Us</Link>
          <Link href="#services" className="hover:text-brand-gold transition-colors">Services</Link>
          <Link href="#contact" className="hover:text-brand-gold transition-colors">Contact Us</Link>
        </div>

        <button className="w-10 h-10 bg-brand-gold flex items-center justify-center hover:bg-brand-charcoal transition-colors">
           <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
      </div>
    </nav>
  )
}
