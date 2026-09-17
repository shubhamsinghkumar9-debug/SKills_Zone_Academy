import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

function Counter({ end, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const steps = 60
    const increment = end / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, (duration * 1000) / steps)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

const stats = [
  { value: 200, suffix: '+', label: 'Active Students', icon: '🎓' },
  { value: 15, suffix: '+', label: 'Expert-Led Courses', icon: '📚' },
  { value: 4, suffix: '.9★', label: 'Average Rating', icon: '⭐' },
  { value: 100, suffix: '%', label: 'Project-Based Learning', icon: '🛠️' },
]

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="relative px-6 py-24 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-gray/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl">

        <div className="grid grid-cols-2 gap-6 mb-24 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-6 text-center transition-colors border glass rounded-2xl border-white/5 group hover:border-brand-green/20"
            >
              <div className="mb-2 text-3xl">{stat.icon}</div>
              <div className="mb-1 text-3xl font-bold text-white md:text-4xl">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-brand-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>

       
        <div ref={ref} className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              className="block mb-4 font-mono text-xs tracking-widest uppercase text-brand-green"
            >
              — About Skills-Zone-Academy
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl"
            >
              We teach code,
              <br />
              <span className="text-brand-green">not just syntax</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 text-base leading-relaxed text-white/60"
            >
              Skill-Zone-Academy was founded with one mission — to bridge the gap between
              traditional education and what the industry actually demands. We believe in learning
              by building real projects, not just watching theory.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 text-base leading-relaxed text-white/60"
            >
              Our courses focus on modern tools, animations, and production-ready code. Every
              concept is taught with a live example — you see it, you do it.
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              href="#courses"
              className="inline-flex items-center gap-2 bg-brand-green text-brand-dark font-bold px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Start Learning Today →
            </motion.a>
          </div>


          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: '🎯', title: 'Project-Based', desc: 'Every course ends with real projects for your portfolio' },
              { icon: '👨‍🏫', title: 'Expert Mentors', desc: 'Learn from Harsh Sharma & industry professionals' },
              { icon: '🌍', title: 'Community', desc: '50K+ students in our Discord & WhatsApp groups' },
              { icon: '♾️', title: 'Lifetime Access', desc: 'Pay once, access content & updates forever' },
              { icon: '📜', title: 'Certificate', desc: 'Industry-recognized completion certificates' },
              { icon: '⚡', title: 'Cutting Edge', desc: 'Always updated with the latest tools & frameworks' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
                className="p-4 transition-colors border glass rounded-xl border-white/5 hover:border-brand-green/20"
              >
                <div className="mb-2 text-2xl">{item.icon}</div>
                <div className="mb-1 text-sm font-semibold text-white">{item.title}</div>
                <div className="text-xs leading-relaxed text-white/40">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
