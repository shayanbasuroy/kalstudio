"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales',
    portfolio: '',
    notes: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // 1. Sign up user via Supabase Auth
    const { data: { user }, error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          phone: formData.phone,
          role: formData.role
        }
      }
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (user) {
      // 2. Ensure user profile exists (in case trigger fails or is delayed)
      try {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email!,
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
            status: 'pending'
          }, { onConflict: 'id' })
        
        if (profileError) {
          console.error("Profile creation error:", profileError)
          // Continue anyway - the trigger might still work
        }
      } catch (profileErr) {
        console.error("Unexpected error creating profile:", profileErr)
        // Continue anyway
      }

      // 3. Insert Application Data (Notes, Portfolio)
      // We use a separate table for this to keep the core user record clean
      const { error: _ } = await supabase
        .from('application_data')
        .insert({
          user_id: user.id,
          role_applying_for: formData.role,
          portfolio_link: formData.portfolio,
          notes: formData.notes
        })

      // 4. Trigger Welcome Email
      try {
        await fetch('/api/notify/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name
          })
        })
      } catch (err) {
        console.error("Welcome email failed:", err)
      }

      // 5. Redirect to dashboard
      // Note: Users will have 'pending' status until approved by owner
      router.push('/dashboard/employee')
    } else {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite p-6 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-charcoal/5">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 w-full">
            <Image src="/logo-icon.png" alt="Kal Studio Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            <Image src="/logo-text.png" alt="Kal Studio" width={120} height={40} className="h-8 w-auto object-contain" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Join the Studio</h1>
          <p className="text-brand-sage text-sm mt-2 font-medium">Apply to join our elite team of creators.</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-8 border border-red-100">{error}</div>}

        <form onSubmit={handleSignup} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Full Name</label>
              <input 
                name="name" type="text" required value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-gold outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Email Address</label>
              <input 
                name="email" type="email" required value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-gold outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Phone</label>
              <input 
                name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-gold outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-4 col-span-2 md:col-span-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Password</label>
              <input 
                name="password" type="password" required value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-gold outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Role applying for</label>
              <select 
                name="role" value={formData.role} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-gold outline-none transition-all appearance-none bg-white"
              >
                <option value="sales">Sales Representative</option>
                <option value="developer">Web Developer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Portfolio Link (Optional)</label>
              <input 
                name="portfolio" type="url" value={formData.portfolio} onChange={handleChange}
                placeholder="https://yourwork.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-gold outline-none transition-all" 
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Why should we hire you?</label>
            <textarea 
              name="notes" rows={3} value={formData.notes} onChange={handleChange}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-gold outline-none transition-all resize-none" 
            />
          </div>

          <button 
            disabled={loading}
            className="col-span-2 w-full mt-4 bg-brand-charcoal text-brand-offwhite py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...</> : 'Submit Application'}
          </button>

          <p className="col-span-2 text-center text-xs text-brand-charcoal/40 mt-4">
            Already have an account? <Link href="/login" className="text-brand-gold font-bold hover:underline">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
