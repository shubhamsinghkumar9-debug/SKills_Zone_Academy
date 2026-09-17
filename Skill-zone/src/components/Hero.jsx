import { motion } from 'framer-motion'
import { ArrowRight, Play, Star } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] },
  }),
}

const avatars = [
  { bg: 'bg-purple-500', letter: 'A' },
  { bg: 'bg-blue-500', letter: 'R' },
  { bg: 'bg-rose-500', letter: 'S' },
  { bg: 'bg-amber-500', letter: 'M' },
]

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16 overflow-hidden text-center">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-brand-green/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />


      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(158,255,0,0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
        }}
      />

      {/* Badge */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="inline-flex items-center gap-2 px-4 py-2 mb-8 font-mono text-xs border rounded-full glass text-brand-green border-brand-green/20"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
        Skills-Zone-Academy Creative Coding School
      </motion.div>

    
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.0] mb-6 max-w-5xl"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        Level up yours{' '}
        <span className="relative inline-block">
          <span className="text-gradient">Career</span>
        </span>{' '}
        <br className="hidden md:block" />
        at{' '}
        <span className="relative">
          <span className="text-brand-green">Skills-Zone-Academy</span>
          <motion.svg
            className="absolute left-0 w-full -bottom-2"
            viewBox="0 0 200 10"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <path
              d="M2 7 Q50 2 100 7 Q150 12 198 7"
              stroke="#9EFF00"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        </span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={2}
        className="max-w-2xl mb-10 text-lg leading-relaxed text-brand-muted md:text-xl"
      >
        Master the most in-demand technical skills with complete computer
        education and hands-on practical training.
      </motion.p>

     
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={3}
        className="flex flex-col items-center gap-4 sm:flex-row mb-14"
      >
        <a
          href="#courses"
          className="btn-primary flex items-center gap-2 bg-brand-green text-brand-dark font-bold text-base px-7 py-3.5 rounded-full glow-green hover:opacity-90 transition-opacity"
        >
          Explore Courses <ArrowRight size={18} />
        </a>
        <a
          href="#reel"
          className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors text-base border border-white/10 px-7 py-3.5 rounded-full hover:border-white/20"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
            <Play size={13} fill="white" />
          </div>
          Watch YouTube
        </a>
      </motion.div>

      {/* Social proof */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={4}
        className="flex flex-col items-center gap-6 sm:flex-row"
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {avatars.map((a, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full ${a.bg} border-2 border-brand-dark flex items-center justify-center text-white text-xs font-bold`}
              >
                {a.letter}
              </div>
            ))}
          </div>
          <span className="text-sm text-brand-muted">1,000+ students</span>
        </div>

        <div className="hidden w-px h-6 sm:block bg-white/10" />

        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill="#9EFF00" className="text-brand-green" />
          ))}
          <span className="ml-1 text-sm text-brand-muted">4.9 / 5.0 rating</span>
        </div>
      </motion.div>

      {/* Floating course cards */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotate: -6 }}
        animate={{ opacity: 1, x: 0, rotate: -6 }}
        transition={{ delay: 1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="absolute hidden p-4 border left-4 md:left-12 bottom-32 glass rounded-2xl w-52 lg:block border-white/5"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 text-xs rounded-lg bg-brand-green/20 text-brand-green">
            🎨
          </div>
          <div>
            <div className="text-xs font-semibold text-white">GSAP Animation</div>
            <div className="text-[10px] text-brand-muted">Front-End Domination</div>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '72%' }}
            transition={{ delay: 1.5, duration: 1 }}
            className="h-full rounded-full bg-brand-green"
          />
        </div>
        <div className="text-[10px] text-brand-muted mt-1 text-right">72% complete</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 60, rotate: 5 }}
        animate={{ opacity: 1, x: 0, rotate: 5 }}
        transition={{ delay: 1.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="absolute hidden p-4 border right-4 md:right-12 bottom-32 glass rounded-2xl w-52 lg:block border-white/5"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🚀</span>
          <div>
            <div className="text-xs font-semibold text-white">New Lesson</div>
            <div className="text-[10px] text-brand-muted">React Deep Dive</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {['React', 'Hooks', 'Context'].map(tag => (
            <span key={tag} className="text-[9px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full border border-brand-green/20">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
