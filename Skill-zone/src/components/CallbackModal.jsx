import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, AlertCircle } from 'lucide-react'
import { callbacksAPI } from '../api/index.js'

const enquiryOptions = [
  'Online Course (Website)', 'Front-End Domination', 'React JS Mastery',
  'Full Stack Development', 'Three.js & WebGL', 'DSA with JavaScript', 'Cohort 2.0', 'Other',
]

export default function CallbackModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', datetime: '', enquiry: 'Online Course (Website)', notes: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [apiError, setApiError]   = useState('')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => { if (!isOpen) { setApiError(''); setSubmitted(false) } }, [isOpen])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    try {
      const res = await callbacksAPI.submit({
        name:         form.name,
        phone:        form.phone,
        email:        form.email,
        scheduled_at: form.datetime,
        enquiry_for:  form.enquiry,
        notes:        form.notes,
      })
      if (res.success) {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setForm({ name: '', phone: '', datetime: '', enquiry: 'Online Course (Website)', notes: '', email: '' })
          onClose()
        }, 2200)
      } else {
        setApiError(res.message || 'Failed to submit. Please try again.')
      }
    } catch {
      setApiError('Cannot reach server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={onClose} />

          <motion.div key="modal" initial={{ opacity: 0, scale: 0.93, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-w-md rounded-2xl border border-white/8 shadow-2xl overflow-hidden" style={{ background: '#111111' }}>
              <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"><X size={20} /></button>

              <div className="px-8 pt-10 pb-8">
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-white text-2xl font-bold mb-2">Request Sent!</h3>
                    <p className="text-white/50 text-sm">Our team will call you back shortly.</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="text-center mb-7">
                      <h2 className="text-white text-2xl font-bold mb-2">Request a Callback</h2>
                      <p className="text-white/50 text-sm leading-relaxed">Fill the form below to request a callback<br />from our team.</p>
                    </div>

                    {apiError && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                        <AlertCircle size={15} className="text-red-400 shrink-0" />
                        <span className="text-red-400 text-sm">{apiError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your Name here" required
                          className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-orange-500/60 transition-colors" />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">Email (optional)</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="For confirmation email"
                          className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-orange-500/60 transition-colors" />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">Phone no.</label>
                        <div className="flex items-center border border-white/15 rounded-lg overflow-hidden focus-within:border-orange-500/60 transition-colors">
                          <div className="flex items-center gap-2 px-3 py-3 border-r border-white/10 bg-transparent shrink-0">
                            <span className="text-base leading-none">🇮🇳</span>
                            <span className="text-white/70 text-sm">+91</span>
                          </div>
                          <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your number here" required
                            className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">Select Date &amp; Time</label>
                        <div className="relative">
                          <input type="datetime-local" name="datetime" value={form.datetime} onChange={handleChange}
                            className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3 text-white/60 text-sm focus:outline-none focus:border-orange-500/60 transition-colors appearance-none pr-10 [color-scheme:dark]" />
                          <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">Enquiry For</label>
                        <div className="relative">
                          <select name="enquiry" value={form.enquiry} onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/60 transition-colors appearance-none pr-10 cursor-pointer">
                            {enquiryOptions.map(opt => <option key={opt} value={opt} className="bg-[#1a1a1a]">{opt}</option>)}
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                          className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-orange-500/60 transition-colors resize-none" />
                      </div>

                      <button type="submit" disabled={loading}
                        className="w-full py-3.5 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #E8623A 0%, #D4522A 100%)' }}>
                        {loading ? 'Submitting…' : 'Submit Request'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
