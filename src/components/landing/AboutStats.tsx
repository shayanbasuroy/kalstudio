"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Reveal Animations
      gsap.from(".about-mission", {
        scrollTrigger: { trigger: ".about-mission", start: "top 80%" },
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });
      gsap.from(".about-craft-title", {
        scrollTrigger: { trigger: ".about-craft-title", start: "top 80%" },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      });
      gsap.from(".about-expertise-text", {
        scrollTrigger: { trigger: ".about-expertise-text", start: "top 80%" },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });
      gsap.from(".about-stat", {
        scrollTrigger: { trigger: ".about-stats-grid", start: "top 80%" },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      });

      // 2. 3D Parallax / Mouse Tilt
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 30;
        const yPos = (clientY / window.innerHeight - 0.5) * 30;

        // Tilt the Arch
        gsap.to(archRef.current, {
          rotateY: xPos * 0.5,
          rotateX: -yPos * 0.5,
          duration: 1.2,
          ease: "power2.out",
        });

        // Drift the Boutique Card
        gsap.to(cardRef.current, {
          x: -xPos * 0.8,
          y: -yPos * 0.8,
          duration: 1.5,
          ease: "power3.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      // 3. Number counters
      const counters = [
        { el: ".counter-projects", target: 10 },
        { el: ".counter-years", target: 1 },
      ];
      counters.forEach(({ el, target }) => {
        const element = document.querySelector(el);
        if (!element) return;
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 1.8,
              ease: "power2.out",
              onUpdate() {
                element.textContent = Math.round(obj.val).toString();
              },
            });
          },
          once: true,
        });
      });

      gsap.from(".about-partner", {
        scrollTrigger: { trigger: ".about-partners", start: "top 85%" },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });

      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full flex justify-center py-16 md:py-24 bg-brand-offwhite overflow-hidden"
    >
      <div className="w-full max-w-[1800px] px-6 md:px-16 lg:px-24">
        {/* Top Mission / Craft Section */}
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-24 mb-20 md:mb-32 items-start">
          {/* Left: Mission */}
          <div className="about-mission relative w-full">
            <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-brand-charcoal mb-4">
              Our Mission
            </h3>
            <p className="text-xs md:text-sm text-brand-charcoal/60 max-w-sm mb-8 leading-relaxed">
              Our goal is to create work that looks beautiful, performs
              effectively, and leaves a lasting impact on your brand's digital
              journey.
            </p>
            <div className="w-full max-w-md aspect-square bg-brand-offwhite relative rounded border border-brand-charcoal/10 overflow-hidden shadow-sm perspective-1000">
              {/* Arch shape */}
              <div
                ref={archRef}
                className="absolute inset-0 p-8 flex items-end justify-center pb-0 overflow-hidden"
              >
                <div className="w-40 md:w-48 h-40 md:h-48 bg-brand-charcoal rounded-t-full shadow-2xl relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-8 bg-brand-gold blur-xl opacity-30"></div>
                </div>
              </div>
              {/* Quote overlay on the image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-charcoal to-transparent">
                <p className="text-brand-offwhite text-[10px] md:text-xs font-medium italic leading-relaxed">
                  "We don't just build websites — we build digital identities
                  that command attention."
                </p>
              </div>
            </div>
          </div>

          {/* Right: We Craft... */}
          <div className="lg:pl-12 mt-12 lg:mt-0">
            <h2 className="about-craft-title text-4xl md:text-6xl font-bold tracking-tighter text-brand-charcoal mb-10 md:mb-12 leading-[1.1]">
              We Craft Digital <br />
              Partnerships.
            </h2>
            <div
              ref={cardRef}
              className="about-card relative group transition-transform duration-700"
            >
              <div className="hidden md:block absolute inset-0 bg-brand-gold/5 blur-3xl rounded-full -z-10 group-hover:bg-brand-gold/10 transition-colors"></div>
              <div className="bg-white p-8 md:p-12 shadow-2xl border border-brand-charcoal/5 relative z-10 lg:-ml-12 min-h-[220px] md:min-h-[280px] flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="text-xl md:text-3xl font-bold text-brand-charcoal leading-tight relative z-10">
                  Powering brands through elite code, high-conversion strategy,
                  and editorial design.
                </h3>
                <div className="flex justify-between items-center mt-10 relative z-10">
                  <span className="text-[9px] md:text-[10px] text-brand-charcoal/50 font-bold uppercase tracking-widest">
                    Based in India / Global Output
                  </span>
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section — improved layout */}
        <div className="grid lg:grid-cols-2 gap-12 md:gap-24 mb-20 md:mb-32 items-center">
          <div className="about-expertise-text text-center lg:text-left">
            <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-brand-charcoal mb-6">
              Proven Scale
            </h3>
            <p className="text-xl md:text-3xl font-medium text-brand-charcoal leading-snug max-w-xl mx-auto lg:mx-0">
              With a background in building{" "}
              <span className="font-bold underline decoration-brand-gold decoration-2 underline-offset-4">
                enterprise solutions,
              </span>{" "}
              we bring elite engineering to businesses of all sizes.
            </p>
          </div>

          {/* Stat blocks — Stack on mobile */}
          <div className="about-stats-grid grid grid-cols-1 md:grid-cols-2 border border-brand-charcoal/10 bg-white shadow-xl">
            <div className="about-stat p-10 md:p-12 border-b md:border-b-0 md:border-r border-brand-charcoal/10 transition-colors hover:bg-brand-offwhite">
              <div className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-brand-charcoal leading-none mb-1">
                <span className="counter-projects">10</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-brand-gold mb-3">
                +
              </div>
              <h4 className="text-[10px] font-bold text-brand-charcoal uppercase tracking-widest mb-1.5">
                Projects Shipped
              </h4>
              <p className="text-[10px] text-brand-charcoal/40 leading-relaxed font-medium">
                Elite engineering and design delivered with precision.
              </p>
            </div>
            <div className="about-stat p-10 md:p-12 transition-colors hover:bg-brand-offwhite">
              <div className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-brand-charcoal leading-none mb-1">
                <span className="counter-years">1</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-brand-gold mb-3">
                +
              </div>
              <h4 className="text-[10px] font-bold text-brand-charcoal uppercase tracking-widest mb-1.5">
                Year of Velocity
              </h4>
              <p className="text-[10px] text-brand-charcoal/40 leading-relaxed font-medium">
                Consistent growth and technical excellence since inception.
              </p>
            </div>
          </div>
        </div>

        {/*
        Partners — improved with line separator
        <div className="about-partners w-full">
          <div className="flex items-center gap-6 mb-10">
            <span className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest whitespace-nowrap">Our Trusted Partners</span>
            <div className="flex-1 h-px bg-brand-charcoal/10"></div>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-8">
             {['Google', 'Vercel', 'Supabase', 'Stripe', 'Figma'].map((partner, i) => (
                <div key={i} className="about-partner group flex items-center gap-3 cursor-default">
                  <span className="w-1.5 h-1.5 bg-brand-gold/60 group-hover:bg-brand-gold rounded-full transition-colors"></span>
                  <span className="text-sm font-bold tracking-wide text-brand-charcoal/40 group-hover:text-brand-charcoal/70 transition-colors">{partner}</span>
                </div>
             ))}
          </div>
        </div>
        */}
      </div>
    </section>
  );
}
