import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'

export default function AuthModal({ onClose, onSuccess, pendingCourse }) {
  const [mode, setMode] = useState('login')       
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Please fill all fields.'); return }
    if (mode === 'register' && !form.name) { setError('Name is required.'); return }

    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await useAuthContext().login(form.email, form.password)
      } else {
        res = await useAuthContext().register(form.name, form.email, form.password)
      }
      if (res?.success) {
        onSuccess()          // opens the pending course
      } else {
        setError(res?.message || 'Something went wrong. Try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return null // See AuthGate below — this file exports AuthGate which wraps this UI
}

// ─── The real export used in Courses.jsx ────────────────────────────────────

import { useAuth } from '../context/AuthContext'

/**
 * Drop-in modal gate.
 *
 * Props:
 *   pendingCourse  – the course object the user tried to open
 *   onClose        – called when the user dismisses the modal
 *   onAuthenticated(course) – called after successful login/register
 */
export function AuthGate({ pendingCourse, onClose, onAuthenticated }) {
  const { login, register } = useAuth()

  const [mode, setMode]         = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState({ name: '', email: '', password: '' })

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Please fill all required fields.'); return }
    if (mode === 'register' && !form.name) { setError('Name is required.'); return }

    setLoading(true)
    try {
      const res = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password)

      if (res?.success) {
        onAuthenticated(pendingCourse)
      } else {
        setError(res?.message || 'Invalid credentials. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md overflow-hidden rounded-3xl"
        style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="w-full h-1 bg-gradient-to-r from-brand-green via-cyan-400 to-brand-green" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-green/15">
                  <Zap size={15} className="text-brand-green" />
                </div>
                <span className="font-mono text-xs tracking-widest uppercase text-brand-green">
                  {mode === 'login' ? 'Welcome back' : 'Get started'}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight text-white">
                {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
              </h2>
              {pendingCourse && (
                <p className="text-white/35 text-xs mt-1.5">
                  to unlock <span className="font-medium text-brand-green">{pendingCourse.title}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center transition-all rounded-full w-9 h-9 bg-white/6 text-white/40 hover:text-white hover:bg-white/10"
            >
              <X size={15} />
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <InputField
                    icon={<User size={14} />}
                    placeholder="Full name"
                    value={form.name}
                    onChange={v => set('name', v)}
                    onKeyDown={handleKey}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              icon={<Mail size={14} />}
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={v => set('email', v)}
              onKeyDown={handleKey}
            />

            <InputField
              icon={<Lock size={14} />}
              placeholder="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={v => set('password', v)}
              onKeyDown={handleKey}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="transition-colors text-white/30 hover:text-white/60"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-rose-400 text-xs mt-3 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 py-3.5 rounded-xl font-bold text-brand-dark text-sm bg-brand-green hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                  className="w-4 h-4 border-2 rounded-full border-brand-dark/30 border-t-brand-dark"
                />
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={15} />
              </>
            )}
          </button>

          {/* Toggle */}
          <p className="mt-4 text-xs text-center text-white/30">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
              className="font-medium text-brand-green hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Shared input component ──────────────────────────────────────────────────

function InputField({ icon, placeholder, type = 'text', value, onChange, onKeyDown, suffix }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors focus-within:border-brand-green/50"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="text-white/25 shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="flex-1 text-sm text-white bg-transparent outline-none placeholder:text-white/25"
      />
      {suffix}
    </div>
  )
}