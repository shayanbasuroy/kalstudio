"use client"
import React, { useEffect, useRef, ReactNode } from 'react'
import gsap from 'gsap'

interface MagneticProps {
  children: ReactNode
  strength?: number
}

export default function Magnetic({ children, strength = 0.5 }: MagneticProps) {
  const magneticRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = magneticRef.current
    if (!el) return

    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" })
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" })

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { height, width, left, top } = el.getBoundingClientRect()
      const x = clientX - (left + width / 2)
      const y = clientY - (top + height / 2)
      xTo(x * strength)
      yTo(y * strength)
    }

    const handleMouseLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener("mousemove", handleMouseMove)
    el.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      el.removeEventListener("mousemove", handleMouseMove)
      el.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [strength])

  return (
    <div ref={magneticRef} className="inline-block">
      {children}
    </div>
  )
}
