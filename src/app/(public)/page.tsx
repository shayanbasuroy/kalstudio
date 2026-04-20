import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import AboutStats from '@/components/landing/AboutStats'
import ServicesBlack from '@/components/landing/ServicesBlack'
import JoinTheTeam from '@/components/landing/JoinTheTeam'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="bg-brand-offwhite min-h-screen text-brand-charcoal overflow-x-hidden selection:bg-brand-gold/30">
      <Navbar />
      <Hero />
      <AboutStats />
      <ServicesBlack />
      <Contact />
      <JoinTheTeam />
      <Footer />
    </main>
  )
}
