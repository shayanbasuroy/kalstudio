import type { Metadata } from "next"
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import AboutStats from '@/components/landing/AboutStats'
import ServicesBlack from '@/components/landing/ServicesBlack'
import Portfolio from '@/components/landing/Portfolio'
import JoinTheTeam from '@/components/landing/JoinTheTeam'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: "Kal Studio — Web Design & Development Agency for Modern Brands",
  description:
    "Kal Studio is a premium web design and development agency building custom websites, landing pages, multi-page funnels, and digital architecture for businesses in India and worldwide. Get a fast, SEO-optimized website that drives growth.",
  openGraph: {
    title: "Kal Studio — Web Design & Development Agency for Modern Brands",
    description:
      "Premium web design and development agency building custom websites, landing pages, and digital architecture for businesses in India and globally.",
  },
};

export default function LandingPage() {
  return (
    <main className="bg-brand-offwhite min-h-screen text-brand-charcoal overflow-x-hidden selection:bg-brand-gold/30">
      <Navbar />
      <Hero />
      <AboutStats />
      <ServicesBlack />
      <Portfolio />
      <Contact />
      <JoinTheTeam />
      <Footer />
    </main>
  )
}
