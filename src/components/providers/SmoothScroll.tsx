"use client"
import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 1. Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: false,
      syncTouch: false,
      wheelMultiplier: 0.5,
      touchMultiplier: 1,
      gestureOrientation: 'vertical',
      touchInertiaExponent: 1.7,
    })

    // 2. Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // 3. Clean up
    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf as (time: number) => void)
    }
  }, [])

  return <>{children}</>
}
