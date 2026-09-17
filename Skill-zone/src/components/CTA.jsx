import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Zap } from 'lucide-react'

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="relative p-12 overflow-hidden text-center border rounded-3xl border-brand-green/20 md:p-20"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(158,255,0,0.08) 0%, rgba(10,10,10,0.95) 70%)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 pointer-events-none border-brand-green/30 rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 pointer-events-none border-brand-green/30 rounded-br-3xl" />

          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-green/5 blur-[80px] pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 font-mono text-xs border rounded-full glass border-brand-green/30 text-brand-green">
              <Zap size={12} fill="#9EFF00" />
              Skills-Zone-Academy now open
            </div>

            <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Ready to build
              <br />
              <span className="text-brand-green">something epic?</span>
            </h2>

            <p className="max-w-xl mx-auto mb-10 text-lg text-white/50">
              Join 1,000+ students who chose SKills-Zone-Academy. Start with any course today
              
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#courses"
                className="flex items-center gap-2 px-8 py-4 text-base font-bold transition-opacity rounded-full btn-primary bg-brand-green text-brand-dark glow-green hover:opacity-90"
              >
                Start Learning Free <ArrowRight size={18} />
              </a>
              <a
                href="#courses"
                className="flex items-center gap-1 text-sm transition-colors text-white/60 hover:text-white"
              >
                Browse all courses →
              </a>
            </div>

            
          </div>
        </motion.div>
      </div>
    </section>
  )
}
