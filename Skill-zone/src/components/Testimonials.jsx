import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Amit Verma',
    role: 'Office Executive',
    avatar: 'AV',
    color: 'bg-violet-500',
    stars: 5,
    text: 'MS Office course helped me a lot in my job. Now I can handle Excel reports, Word documents, and presentations easily. Highly recommended for beginners.',
  },
  {
    name: 'Neha Sharma',
    role: 'Accountant',
    avatar: 'NS',
    color: 'bg-rose-500',
    stars: 5,
    text: 'Tally & GST training was very practical. I learned billing, GST returns, and accounting from scratch. Got a job within 1 month of completing the course.',
  },
  {
    name: 'Rahul Gupta',
    role: 'Web Designer',
    avatar: 'RG',
    color: 'bg-blue-500',
    stars: 5,
    text: 'Web Designing course is amazing. I learned how to create responsive websites and now I am working on freelance projects.',
  },
  {
    name: 'Pooja Yadav',
    role: 'Software Developer',
    avatar: 'PY',
    color: 'bg-emerald-500',
    stars: 5,
    text: 'Programming course (C, C++, Java, Python) built my strong foundation. Teachers explain concepts very clearly with practical examples.',
  },
  {
    name: 'Sandeep Kumar',
    role: 'Graphic Designer',
    avatar: 'SK',
    color: 'bg-amber-500',
    stars: 5,
    text: 'Graphic Designing course helped me learn Photoshop and CorelDRAW. Now I design posters, logos, and social media creatives professionally.',
  },
  {
    name: 'Ritika Singh',
    role: 'Digital Marketer',
    avatar: 'RS',
    color: 'bg-cyan-500',
    stars: 5,
    text: 'Digital Marketing course gave me real skills in SEO and social media ads. I am now managing online campaigns for local businesses.',
  },
]

function TestimonialCard({ t, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      className="flex flex-col gap-4 p-6 border card-hover glass rounded-2xl border-white/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
            {t.avatar}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{t.name}</div>
            <div className="text-xs text-brand-muted">{t.role}</div>
          </div>
        </div>
        <Quote size={20} className="text-brand-green/30" />
      </div>

      <div className="flex gap-0.5">
        {[...Array(t.stars)].map((_, i) => (
          <Star key={i} size={12} fill="#9EFF00" className="text-brand-green" />
        ))}
      </div>

      <p className="text-sm leading-relaxed text-white/60">{t.text}</p>
    </motion.div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="community" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div ref={ref} className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="block mb-4 font-mono text-xs tracking-widest uppercase text-brand-green"
          >
            — Student Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="mb-4 text-4xl font-bold leading-tight text-white md:text-6xl"
          >
            Loved by{' '}
            <span className="text-gradient">1,000+</span>
            <br />
            students 
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
