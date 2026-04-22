"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // In production, configure next.config to allow Supabase sessions or use server actions.
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('email_not_confirmed')) {
        setError("Please check your inbox to confirm your email before logging in.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    if (user) {
      // 1. Fetch role and status
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', user.id)
        .single()
      let profile = profileData

      // 2. AUTO-REPAIR: Gracefully handle missing profiles or race conditions with the trigger
      if (profileError || !profileData) {
        try {
          // Extract metadata with fallbacks
          const metadata = user.user_metadata || {}
          const userName = metadata.full_name || metadata.name || 'New User'
          const userRole = metadata.role || 'sales'
          const userPhone = metadata.phone || ''
          
          // Validate role is a valid enum value
          const validRoles = ['owner', 'sales', 'developer']
          const safeRole = validRoles.includes(userRole) ? userRole : 'sales'
          
          const { data: newProfile, error: repairError } = await supabase
            .from('users')
            .upsert({ 
              id: user.id, 
              email: user.email!, 
              name: userName,
              phone: userPhone,
              role: safeRole,
              status: 'pending'
            }, { onConflict: 'id' })
            .select('role, status')
            .single()
          
          if (repairError) {
            console.error("Repair error details:", repairError)
            
            // Special handling for RLS recursion error
            if (repairError.message.includes('infinite recursion detected in policy')) {
              setError(`Database policy error detected. This requires a SQL fix. Please run the fix script in Supabase SQL Editor:
              
              1. Open Supabase Dashboard → SQL Editor
              2. Copy contents from: /supabase/fix_rls_recursion_v2.sql
              3. Run the script
              4. Try logging in again
              
              Error details: ${repairError.message}`)
            } else {
              setError(`Profile sync failed: ${repairError.message}. Please contact support.`)
            }
            setLoading(false)
            return
          }
          profile = newProfile
        } catch (catchError) {
          console.error("Unexpected error during profile repair:", catchError)
          setError("Unexpected error during profile creation. Please contact support.")
          setLoading(false)
          return
        }
      }

      if (profile?.role === 'owner') {
        router.push('/dashboard/owner')
      } else {
        router.push('/dashboard/employee')
      }
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-brand-charcoal/5">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 w-full">
            <Image src="/logo-icon.png" alt="Kal Studio Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            <Image src="/logo-text.png" alt="Kal Studio" width={120} height={40} className="h-8 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-brand-sage text-sm mt-2">Sign in to your dashboard</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 border-b-0">Email</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold outline-none" 
            />
          </div>
          <button 
            disabled={loading}
            className="w-full mt-4 bg-brand-charcoal text-brand-offwhite py-3 rounded-lg font-bold hover:bg-brand-gold transition-colors disabled:opacity-70"
          >
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
