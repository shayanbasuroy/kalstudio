import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="w-full bg-brand-charcoal text-brand-offwhite flex justify-center">
      <div className="w-full max-w-[1800px] px-8 md:px-16 lg:px-24">

        {/* Top: Logo + Tagline + Nav */}
        <div className="py-20 border-b border-brand-offwhite/10 flex flex-col lg:flex-row justify-between items-start gap-16">

          {/* Brand block */}
          <div className="max-w-xs">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src="/logo-icon.png"
                alt="Kal Studio Icon"
                width={48}
                height={48}
                className="w-12 h-12 object-contain brightness-0 invert"
              />
              <Image
                src="/logo-text.png"
                alt="Kal Studio"
                width={180}
                height={52}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-sm text-brand-offwhite/50 leading-relaxed">
              A creative studio transforming bold ideas into powerful digital structures. We help Kolkata&apos;s modern brands build identity, impact, and growth.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-6">Navigate</h4>
              <ul className="space-y-4 text-sm font-medium text-brand-offwhite/60">
                <li><Link href="#home" className="hover:text-brand-offwhite transition-colors">Home</Link></li>
                <li><Link href="#about" className="hover:text-brand-offwhite transition-colors">About Us</Link></li>
                <li><Link href="#services" className="hover:text-brand-offwhite transition-colors">Services</Link></li>
                <li><Link href="#contact" className="hover:text-brand-offwhite transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-6">Services</h4>
              <ul className="space-y-4 text-sm font-medium text-brand-offwhite/60">
                <li>Landing Pages</li>
                <li>Multi-Page Sites</li>
                <li>Photography</li>
                <li>Custom Apps</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-6">Connect</h4>
              <ul className="space-y-4 text-sm font-medium text-brand-offwhite/60">
                <li><a href="#" className="hover:text-brand-offwhite transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-brand-offwhite transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-brand-offwhite transition-colors">LinkedIn</a></li>
                <li>
                  <Link href="/login" className="text-brand-gold hover:text-brand-offwhite transition-colors font-bold">
                    Client Login →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-brand-offwhite/30 font-mono tracking-wider uppercase">
            © {new Date().getFullYear()} Kal Studio — All Rights Reserved
          </p>
          <p className="text-[10px] text-brand-offwhite/30 font-mono tracking-wider uppercase">
            Kolkata, India · kalstudio.in
          </p>
        </div>

      </div>
    </footer>
  )
}
