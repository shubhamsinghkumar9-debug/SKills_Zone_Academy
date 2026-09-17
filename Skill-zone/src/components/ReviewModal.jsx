import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Send, CheckCircle, Loader2, MessageSquareHeart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const COURSES = [
  'General / Institute Feedback',
  'Frontend Development',
  'Fullstack Development',
  'Backend Development',
  'DevOps',
  'Creative Dev',
  'Computer Science',
  'Cohort Program',
]

const TAGS = ['Great Content', 'Amazing Instructor', 'Loved the Community', 'Worth Every Rupee', 'Changed My Career', 'Best Platform']

export default function ReviewModal({ isOpen, onClose }) {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name:    user?.name  || '',
    email:   user?.email || '',
    course:  COURSES[0],
    rating:  0,
    title:   '',
    message: '',
    tags:    [],
  })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const ratingLabel = ['', 'Poor 😕', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🔥'][form.rating] || ''

  const validate = () => {
    if (!form.name.trim())    return 'Please enter your name.'
    if (!form.email.trim())   return 'Please enter your email.'
    if (form.rating === 0)    return 'Please give a star rating.'
    if (!form.message.trim()) return 'Please write your review.'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // reset after exit animation
    setTimeout(() => {
      setSubmitted(false)
      setError('')
      setForm({
        name:    user?.name  || '',
        email:   user?.email || '',
        course:  COURSES[0],
        rating:  0,
        title:   '',
        message: '',
        tags:    [],
      })
    }, 400)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1,    opacity: 1, y: 0 }}
            exit={{   scale: 0.92, opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/8 rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Decorative top bar ── */}
            <div className="h-1 w-full bg-gradient-to-r from-[#9EFF00] via-[#c6ff4d] to-[#9EFF00]" />

            {/* ── Close ── */}
            <button
              onClick={handleClose}
              className="absolute z-10 flex items-center justify-center w-8 h-8 transition-all top-4 right-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
            >
              <X size={15} />
            </button>

            {/* ── Success state ── */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-[#9EFF00]/10 flex items-center justify-center"
                  >
                    <CheckCircle size={32} className="text-[#9EFF00]" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">Thanks for your review! 🙏</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-white/50">
                    Your feedback means the world to us. We read every single review and use it to keep improving.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-6 py-2.5 bg-[#9EFF00] text-black text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {/* ── Header ── */}
                  <div className="px-6 pt-6 pb-5">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-xl bg-[#9EFF00]/10 flex items-center justify-center">
                        <MessageSquareHeart size={17} className="text-[#9EFF00]" />
                      </div>
                      <h2 className="text-lg font-bold text-white">Share Your Experience</h2>
                    </div>
                    <p className="ml-12 text-xs text-white/35">Your feedback helps 50,000+ students choose the right course.</p>
                  </div>

                  {/* ── Scrollable form body ── */}
                  <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Name + Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-white/35 uppercase tracking-widest mb-1.5 font-medium">Name</label>
                        <input
                          value={form.name}
                          onChange={e => set('name', e.target.value)}
                          placeholder="Your name"
                          className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#9EFF00]/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/35 uppercase tracking-widest mb-1.5 font-medium">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                          placeholder="you@email.com"
                          className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#9EFF00]/40 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Course */}
                    <div>
                      <label className="block text-[11px] text-white/35 uppercase tracking-widest mb-1.5 font-medium">Reviewing</label>
                      <select
                        value={form.course}
                        onChange={e => set('course', e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9EFF00]/40 transition-colors appearance-none"
                      >
                        {COURSES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                      </select>
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="block text-[11px] text-white/35 uppercase tracking-widest mb-2 font-medium">Rating</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => set('rating', star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star
                              size={28}
                              className="transition-colors duration-150"
                              style={{
                                fill:   star <= (hoveredStar || form.rating) ? '#9EFF00' : 'transparent',
                                color:  star <= (hoveredStar || form.rating) ? '#9EFF00' : 'rgba(255,255,255,0.15)',
                                filter: star <= (hoveredStar || form.rating) ? 'drop-shadow(0 0 6px #9EFF0066)' : 'none',
                              }}
                            />
                          </button>
                        ))}
                        {ratingLabel && (
                          <motion.span
                            key={ratingLabel}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-2 text-sm text-[#9EFF00] font-medium"
                          >
                            {ratingLabel}
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {/* Review Title */}
                    <div>
                      <label className="block text-[11px] text-white/35 uppercase tracking-widest mb-1.5 font-medium">Headline <span className="normal-case opacity-50">(optional)</span></label>
                      <input
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="e.g. Best coding course I've taken!"
                        className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#9EFF00]/40 transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[11px] text-white/35 uppercase tracking-widest mb-1.5 font-medium">Your Review</label>
                      <textarea
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        rows={4}
                        placeholder="Tell us what you loved, what could be better, and how this helped you..."
                        className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#9EFF00]/40 resize-none transition-colors"
                      />
                      <div className="text-right text-[11px] text-white/20 mt-1">{form.message.length}/500</div>
                    </div>

                    {/* Quick tags */}
                    <div>
                      <label className="block text-[11px] text-white/35 uppercase tracking-widest mb-2 font-medium">Quick Tags <span className="normal-case opacity-50">(optional)</span></label>
                      <div className="flex flex-wrap gap-2">
                        {TAGS.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              form.tags.includes(tag)
                                ? 'bg-[#9EFF00]/15 border-[#9EFF00]/40 text-[#9EFF00]'
                                : 'bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                      >
                        {error}
                      </motion.p>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#9EFF00] text-black font-bold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {loading
                        ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                        : <><Send size={14} /> Submit Review</>
                      }
                    </button>

                    <p className="text-center text-[11px] text-white/20 pb-1">
                      Your review may be displayed publicly on the site.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}