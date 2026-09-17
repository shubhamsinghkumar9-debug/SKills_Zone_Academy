import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignInModal({ isOpen, onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode]         = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccess]= useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => { setApiError(''); setSuccess(''); setForm({ name: '', email: '', password: '' }) }, [isOpen, mode])

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password)
      if (res.success) {
        setSuccess(mode === 'login' ? 'Welcome back! 🎉' : 'Account created! Welcome to Skills Zone 🎉')
        setTimeout(() => onClose(), 1200)
      } else {
        setApiError(res.message || 'Something went wrong.')
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
          <motion.div key="si-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={onClose} />

          <motion.div key="si-modal" initial={{ opacity: 0, scale: 0.93, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-w-md overflow-hidden border shadow-2xl rounded-2xl border-white/8" style={{ background: '#111111' }}>
              <div className="h-[3px] w-full bg-brand-green" />
              <button onClick={onClose} className="absolute z-10 transition-colors top-4 right-4 text-white/40 hover:text-white"><X size={18} /></button>

              <div className="px-8 pt-8 pb-10">
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="flex items-center justify-center w-24 h-8 rounded-lg bg-brand-green">
                    <span className="font-mono text-sm font-bold text-brand-dark">SKILL-ZONE</span>
                  </div>
                  <span className="text-lg font-semibold tracking-tight text-white">Academy</span>
                </div>

                <div className="flex gap-1 mb-6 bg-white/[0.04] rounded-xl p-1">
                  {['login', 'register'].map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      className={"flex-1 py-2 rounded-lg text-sm font-medium transition-all " + (mode === m ? 'bg-brand-green text-brand-dark' : 'text-white/50 hover:text-white')}>
                      {m === 'login' ? 'Sign In' : 'Register'}
                    </button>
                  ))}
                </div>

                <h2 className="mb-1 text-2xl font-bold text-white">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                <p className="mb-6 text-sm leading-relaxed text-white/40">
                  {mode === 'login' ? 'Sign in to continue your learning journey' : 'Join thousands of students at Skills Zone'}
                </p>

                {apiError && (
                  <div className="flex items-center gap-2 px-4 py-3 mb-4 border bg-red-500/10 border-red-500/20 rounded-xl">
                    <AlertCircle size={15} className="text-red-400 shrink-0" />
                    <span className="text-sm text-red-400">{apiError}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="px-4 py-3 mb-4 border bg-brand-green/10 border-brand-green/20 rounded-xl">
                    <span className="text-sm text-brand-green">{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-white/55 text-xs mb-1.5">Full Name</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors" />
                    </div>
                  )}
                  <div>
                    <label className="block text-white/55 text-xs mb-1.5">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-white/55 text-xs mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                        placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter your password'} required
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-green/50 transition-colors" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-white/30 hover:text-white/60">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {mode === 'login' && (
                    <div className="-mt-1 text-right">
                      <a href="#" className="text-xs transition-colors text-brand-green/80 hover:text-brand-green">Forgot password?</a>
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-brand-green text-brand-dark font-bold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60">
                    {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </form>

                <p className="pt-4 text-xs text-center text-white/30">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="transition-colors text-brand-green/90 hover:text-brand-green">
                    {mode === 'login' ? 'Create one free' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
