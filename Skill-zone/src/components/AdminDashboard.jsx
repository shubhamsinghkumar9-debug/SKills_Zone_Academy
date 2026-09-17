import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Users, TrendingUp, Settings,
  Plus, Search, Edit2, Trash2, X, Star,
  Clock, DollarSign, Eye, EyeOff, Save,
  AlertTriangle, CheckCircle, BarChart2, ArrowUpRight,
  ArrowDownRight, LogOut, Bell, Award, Globe,
  Zap, Menu, Loader2, RefreshCw, ChevronDown, Tag,
  FileText, Lock, Filter, Download, ExternalLink, Link2
} from 'lucide-react'

import { adminAPI, adminCoursesAPI, adminStudentsAPI, callbacksAPI, coursesAPI } from '../api/index.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt         = (n) => new Intl.NumberFormat('en-IN').format(n ?? 0)
const fmtCurrency = (n) => `₹${fmt(n)}`
const fmtPrice    = (val) => {
  if (!val && val !== 0) return ''
  if (typeof val === 'string' && val.startsWith('₹')) return val
  return `₹${Number(val).toLocaleString('en-IN')}`
}

const CATEGORIES  = ['Frontend', 'Fullstack', 'Creative Dev', 'Computer Science', 'Cohort', 'Backend', 'DevOps']
const LEVELS      = ['Beginner', 'Intermediate', 'Advanced', 'Beginner to Advanced', 'Intermediate to Advanced', 'All Levels']
const TAG_OPTIONS = ['BESTSELLER', 'POPULAR', 'COMPREHENSIVE', 'NICHE', 'IN-DEMAND', 'LIVE', 'NEW', 'TRENDING']

const tagColorMap = {
  amber:  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  blue:   'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  green:  'bg-green-500/15 text-green-400 border border-green-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  red:    'bg-red-500/15 text-red-400 border border-red-500/20',
  orange: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
}

// ─── Shared form primitives (defined OUTSIDE modals so they never re-mount) ──
// These are plain elements, NOT components — used inline to avoid identity loss.
const inputCls = (hasErr) =>
  `w-full bg-[#0A0A0A] border rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3B3B3B] focus:outline-none transition-colors ${
    hasErr ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-[#9EFF00]/40'
  }`

const baseCls =
  'w-full bg-[#0A0A0A] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9EFF00]/40 transition-colors'

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl ${
        type === 'success'
          ? 'bg-[#141414] border-[#9EFF00]/30 text-white'
          : 'bg-[#141414] border-red-500/30 text-white'
      }`}
    >
      {type === 'success'
        ? <CheckCircle size={16} className="text-[#9EFF00]" />
        : <AlertTriangle size={16} className="text-red-400" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, trend, accent }) {
  const isUp = trend > 0
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: `${accent}15` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-[#9EFF00]' : 'text-red-400'}`}>
            {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mb-1 text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-[#6B6B6B]">{label}</div>
      {sub && <div className="text-xs text-[#4B4B4B] mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-[#161616] border border-white/8 rounded-2xl p-6 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <h3 className="font-semibold text-white">Confirm Action</h3>
        </div>
        <p className="text-[#A0A0A0] text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#6B6B6B] text-sm hover:text-white hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Course Modal ─────────────────────────────────────────────────────────────
// FIX: All sub-components (Field, Input, Select) moved OUTSIDE or rendered as
// plain JSX — no nested component definitions inside the render body.
function CourseModal({ course, onSave, onClose }) {
  const isNew = !course.id && !course._id
  const [form, setForm]     = useState({
    id:             course.id || '',
    emoji:          course.emoji || '📚',
    tag:            course.tag || '',
    tagColor:       course.tagColor || 'green',
    title:          course.title || '',
    subtitle:       course.subtitle || '',
    desc:           course.desc || '',
    longDesc:       course.longDesc || '',
    instructor:     course.instructor || 'Harsh Sharma',
    instructorRole: course.instructorRole || 'Founder, Skill-Zone',
    rating:         course.rating || '4.9',
    students:       course.students || 0,
    hours:          course.hours || '',
    price:          course.price || '',
    originalPrice:  course.originalPrice || '',
    category:       course.category || 'Frontend',
    level:          course.level || 'Beginner to Advanced',
    status:         course.status || 'draft',
    gradient:       course.gradient || 'from-green-500/25 to-emerald-500/10',
    accent:         course.accent || '#9EFF00',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Stable setter — won't change identity between renders
  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.id.trim())    errs.id    = 'Required'
    if (!form.title.trim()) errs.title = 'Required'
    if (!form.price)        errs.price = 'Required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try { await onSave(form, isNew) }
    finally { setSaving(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">{isNew ? '+ New Course' : 'Edit Course'}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#6B6B6B] hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
          {/* Row: ID + Emoji */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Course ID (slug)</label>
              <input value={form.id} onChange={e => set('id', e.target.value)} placeholder="e.g. react-mastery" className={inputCls(errors.id)} />
              {errors.id && <p className="mt-1 text-xs text-red-400">{errors.id}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Emoji</label>
              <input value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="📚" className={inputCls(false)} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Course title" className={inputCls(errors.title)} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Subtitle</label>
            <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Short subtitle" className={inputCls(false)} />
          </div>

          {/* Short Desc */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Short Description</label>
            <textarea
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              rows={2}
              placeholder="Brief description shown on course card..."
              className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3B3B3B] focus:outline-none focus:border-[#9EFF00]/40 resize-none transition-colors"
            />
          </div>

          {/* Long Desc */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Long Description</label>
            <textarea
              value={form.longDesc}
              onChange={e => set('longDesc', e.target.value)}
              rows={3}
              placeholder="Detailed course description shown in overview tab..."
              className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3B3B3B] focus:outline-none focus:border-[#9EFF00]/40 resize-none transition-colors"
            />
          </div>

          {/* Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="4999" className={inputCls(errors.price)} />
              {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Original Price (₹)</label>
              <input type="number" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="12999" className={inputCls(false)} />
            </div>
          </div>

          {/* Hours / Rating / Students */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Hours</label>
              <input value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="80+" className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Rating</label>
              <input value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.9" className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Students</label>
              <input type="number" value={form.students} onChange={e => set('students', e.target.value)} placeholder="0" className={inputCls(false)} />
            </div>
          </div>

          {/* Category / Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={baseCls}>
                {CATEGORIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Level</label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className={baseCls}>
                {LEVELS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Tag / Tag Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Tag</label>
              <select value={form.tag} onChange={e => set('tag', e.target.value)} className={baseCls}>
                {['', ...TAG_OPTIONS].map(o => <option key={o} value={o}>{o || '— None —'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Tag Color</label>
              <select value={form.tagColor} onChange={e => set('tagColor', e.target.value)} className={baseCls}>
                {['amber', 'blue', 'green', 'purple', 'red', 'orange'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Instructor</label>
              <input value={form.instructor} onChange={e => set('instructor', e.target.value)} placeholder="Harsh Sharma" className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Instructor Role</label>
              <input value={form.instructorRole} onChange={e => set('instructorRole', e.target.value)} placeholder="Founder, Skill-Zone" className={inputCls(false)} />
            </div>
          </div>

          {/* Gradient / Accent */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Gradient CSS</label>
              <input value={form.gradient} onChange={e => set('gradient', e.target.value)} placeholder="from-green-500/25 to-emerald-500/10" className={inputCls(false)} />
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent} onChange={e => set('accent', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/8 bg-[#0A0A0A] cursor-pointer" />
                <input value={form.accent} onChange={e => set('accent', e.target.value)} placeholder="#9EFF00" className={inputCls(false)} />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={baseCls}>
              {['published', 'draft', 'archived'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-[#6B6B6B] text-sm hover:text-white hover:border-white/20 transition-all">
            Cancel
          </button>
          <button
            // onClick={handleSave}
            disabled={true}

            className="flex disabled items-center gap-2 px-5 py-2.5 bg-[#9EFF00] text-black font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? 'Create Course' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Student Edit Modal ────────────────────────────────────────────────────────
function StudentModal({ student, onSave, onClose }) {
  const [form, setForm] = useState({
    name:  student.name  || '',
    email: student.email || '',
    role:  student.role  || 'student',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(student._id || student.id, form) }
    finally { setSaving(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Edit Student</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#6B6B6B] hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: 'Name',  field: 'name',  type: 'text' },
            { label: 'Email', field: 'email', type: 'email' },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className={baseCls}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={baseCls}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-[#6B6B6B] text-sm hover:text-white transition-all">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9EFF00] text-black font-semibold text-sm rounded-xl hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Note Modal ───────────────────────────────────────────────────────────────
function NoteModal({ note, courses, onSave, onClose }) {
  const isNew = !note._id && !note.id
  const [form, setForm] = useState({
    title:       note.title       || '',
    description: note.description || '',
    courseId:    note.courseId    || '',
    driveLink:   note.driveLink   || '',
    fileSize:    note.fileSize    || '',
    visible:     note.visible     !== undefined ? note.visible : true,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.title.trim())     errs.title     = 'Required'
    if (!form.driveLink.trim()) errs.driveLink = 'Required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try { await onSave(form, isNew, note._id || note.id) }
    finally { setSaving(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">{isNew ? '+ Add Notes' : 'Edit Notes'}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#6B6B6B] hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Notes Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Week 1 - JavaScript Basics" className={inputCls(errors.title)} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              placeholder="What does this notes file cover?"
              className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3B3B3B] focus:outline-none focus:border-[#9EFF00]/40 resize-none transition-colors"
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Link to Course (optional)</label>
            <select value={form.courseId} onChange={e => set('courseId', e.target.value)} className={baseCls}>
              <option value="">— General / All Courses —</option>
              {courses.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.emoji || '📚'} {c.title}</option>
              ))}
            </select>
          </div>

          {/* Google Drive Link */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">Google Drive PDF Link *</label>
            <div className="relative">
              <Link2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <input
                value={form.driveLink}
                onChange={e => set('driveLink', e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className={`${inputCls(errors.driveLink)} pl-9`}
              />
            </div>
            {errors.driveLink && <p className="mt-1 text-xs text-red-400">{errors.driveLink}</p>}
            <p className="mt-1 text-xs text-[#4B4B4B]">Paste the shareable Google Drive link. Make sure "Anyone with the link can view" is enabled.</p>
          </div>

          {/* File size */}
          <div>
            <label className="block text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">File Size (optional)</label>
            <input value={form.fileSize} onChange={e => set('fileSize', e.target.value)} placeholder="e.g. 2.4 MB" className={inputCls(false)} />
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Visible to Students</p>
              <p className="text-xs text-[#6B6B6B]">Students can see and download this file</p>
            </div>
            <button
              onClick={() => set('visible', !form.visible)}
              className="relative flex-shrink-0 transition-colors rounded-full"
              style={{ width: 40, height: 22, background: form.visible ? '#9EFF00' : 'rgba(255,255,255,0.1)' }}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-transform shadow ${form.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-[#6B6B6B] text-sm hover:text-white hover:border-white/20 transition-all">
            Cancel
          </button>
          <button
            // onClick={handleSave}
            disabled={true}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9EFF00] text-black font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? 'Add Notes' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div> 
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function TableSkeleton({ rows = 5 }) {
  return (
    <div className="p-4 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  )
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({ showToast }) {
  const [stats,     setStats]     = useState(null)
  const [callbacks, setCallbacks] = useState([])
  const [loading,   setLoading]   = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, cbRes] = await Promise.all([
        adminAPI.stats(),
        adminAPI.listCallbacks({ per_page: 10 }),
      ])
      if (statsRes.success) setStats(statsRes.data)
      if (cbRes.success)    setCallbacks(cbRes.data.items || [])
    } catch { showToast('Failed to load stats', 'error') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const updateCbStatus = async (id, status) => {
    const res = await adminAPI.updateCallbackStatus(id, status)
    if (res.success) {
      setCallbacks(prev => prev.map(c => c._id === id ? { ...c, status } : c))
      showToast('Status updated', 'success')
    } else {
      showToast(res.message || 'Failed', 'error')
    }
  }

  const ov = stats?.overview || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Overview</h2>
          <p className="text-xs text-[#6B6B6B]">Platform at a glance</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 transition-all">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#111] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Students"    value={fmt(ov.total_students)}    icon={Users}    trend={ov.new_students_this_month > 0 ? 8 : 0}    accent="#60A5FA" sub={`+${ov.new_students_this_month || 0} this month`} />
          <StatCard label="Total Courses"     value={fmt(ov.total_courses)}     icon={BookOpen} trend={0}                                           accent="#9EFF00" />
          <StatCard label="Enrollments"       value={fmt(ov.total_enrollments)} icon={Award}    trend={ov.new_enrollments_this_month > 0 ? 12 : 0}  accent="#A78BFA" sub={`+${ov.new_enrollments_this_month || 0} this month`} />
          <StatCard label="Pending Callbacks" value={fmt(ov.pending_callbacks)} icon={Bell}     trend={0}                                           accent="#FBBF24" />
        </div>
      )}

      {stats?.top_courses?.length > 0 && (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">🔥 Most Enrolled Courses</h3>
          <div className="space-y-3">
            {stats.top_courses.map((tc, i) => (
              <div key={tc.course_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#4B4B4B] text-xs font-mono w-4">#{i + 1}</span>
                  <span>{tc.emoji || '📚'}</span>
                  <span className="text-sm text-white">{tc.title}</span>
                </div>
                <span className="text-[#9EFF00] text-sm font-mono font-semibold">{fmt(tc.enrollments)} enrolled</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {callbacks.length > 0 && (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Recent Callback Requests</h3>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {callbacks.map(cb => (
              <div key={cb._id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-white">{cb.name}</div>
                  <div className="text-xs text-[#6B6B6B]">{cb.phone} · {cb.course || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    cb.status === 'done'    ? 'bg-[#9EFF00]/10 text-[#9EFF00]' :
                    cb.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-white/5 text-[#6B6B6B]'
                  }`}>{cb.status}</span>
                  {cb.status === 'pending' && (
                    <button
                      onClick={() => updateCbStatus(cb._id, 'done')}
                      className="text-xs px-2.5 py-1 bg-[#9EFF00]/10 text-[#9EFF00] rounded-full hover:bg-[#9EFF00]/20 transition-all"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Courses Section ──────────────────────────────────────────────────────────
function CoursesSection({ showToast }) {
  const [courses,       setCourses]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await coursesAPI.list({ per_page: 100 })
      if (res.success) setCourses(res.data.courses ?? res.data.items ?? [])
      else showToast(res.message || 'Failed to load courses', 'error')
    } catch { showToast('Network error', 'error') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  const filtered = courses.filter(c =>
    (c.title    || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (formData, isNew) => {
    try {
      let res
      if (isNew) {
        res = await adminCoursesAPI.create(formData)
      } else {
        const id = editingCourse.id || editingCourse._id
        res = await adminCoursesAPI.update(id, formData)
      }
      if (res.success) {
        showToast(isNew ? 'Course created!' : 'Course updated!', 'success')
        setModalOpen(false)
        setEditingCourse(null)
        fetchCourses()
      } else {
        showToast(res.message || 'Save failed', 'error')
      }
    } catch { showToast('Network error', 'error') }
  }

  const handleDelete = async (course) => {
    setDeleting(true)
    try {
      const id  = course.id || course._id
      // const res = await adminCoursesAPI.delete(id)
      if (res.success) {
        showToast('Course deleted', 'success')
        setCourses(prev => prev.filter(c => (c.id || c._id) !== id))
        setConfirmDelete(null)
      } else {
        showToast(res.message || 'Delete failed', 'error')
      }
    } catch { showToast('Network error', 'error') }
    finally  { setDeleting(false) }
  }

  const toggleStatus = async (course) => {
    const id        = course.id || course._id
    const newStatus = course.status === 'published' ? 'draft' : 'published'
    setCourses(prev => prev.map(c => (c.id || c._id) === id ? { ...c, status: newStatus } : c))
    const res = await adminCoursesAPI.update(id, { status: newStatus })
    if (!res.success) {
      setCourses(prev => prev.map(c => (c.id || c._id) === id ? { ...c, status: course.status } : c))
      showToast('Failed to update status', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Courses</h2>
          <p className="text-xs text-[#6B6B6B]">{courses.length} courses in database</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchCourses} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/8 flex items-center justify-center text-[#6B6B6B] hover:text-white transition-all" title="Refresh">
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => { setEditingCourse(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9EFF00] text-black font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Add Course
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#3B3B3B] focus:outline-none focus:border-[#9EFF00]/30 transition-colors"
        />
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <TableSkeleton /> : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Course</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3">Rating</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Students</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{c.emoji || '📚'}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{c.title}</div>
                          <div className="text-xs text-[#6B6B6B]">{c.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      {c.tag && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColorMap[c.tagColor] || tagColorMap.green}`}>
                          {c.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 text-sm text-amber-400">
                        <Star size={11} className="fill-amber-400" />{c.rating || '—'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <span className="font-mono text-sm text-white">{fmt(c.students)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-[#9EFF00]">{fmtPrice(c.price)}</div>
                      {c.originalPrice && <div className="text-xs text-[#4B4B4B] line-through">{fmtPrice(c.originalPrice)}</div>}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all ${
                          c.status === 'published'
                            ? 'bg-[#9EFF00]/10 text-[#9EFF00] hover:bg-[#9EFF00]/20'
                            : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        }`}
                      >
                        {c.status === 'published' ? <Eye size={11} /> : <EyeOff size={11} />}
                        {c.status || 'draft'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => { setEditingCourse(c); setModalOpen(true) }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#9EFF00]/10 hover:text-[#9EFF00] flex items-center justify-center text-[#6B6B6B] transition-all"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-[#6B6B6B] transition-all"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[#6B6B6B] text-sm">
              {search ? 'No courses match your search.' : 'No courses in database. Create one!'}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <CourseModal
            course={editingCourse || {}}
            onSave={handleSave}
            onClose={() => { setModalOpen(false); setEditingCourse(null) }}
          />
        )}
        {confirmDelete && (
          <ConfirmDialog
            message={`Delete "${confirmDelete.title}"? This cannot be undone and will remove all enrollments.`}
            loading={deleting}
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Students Section ─────────────────────────────────────────────────────────
function StudentsSection({ showToast }) {
  const [students,       setStudents]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState('')
  const [page,           setPage]           = useState(1)
  const [totalPages,     setTotalPages]     = useState(1)
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleting,       setDeleting]       = useState(false)

  const fetchStudents = useCallback(async (p = 1, q = '') => {
    setLoading(true)
    try {
      const res = await adminStudentsAPI.list({ page: p, per_page: 20, q })
      if (res.success) {
        setStudents(res.data.students || [])
        setTotalPages(res.data.pagination?.pages || 1)
      } else {
        showToast(res.message || 'Failed to load students', 'error')
      }
    } catch { showToast('Network error', 'error') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => { fetchStudents(1, search); setPage(1) }, 300)
    return () => clearTimeout(timeout)
  }, [search, fetchStudents])

  useEffect(() => { fetchStudents(page, search) }, [page, fetchStudents])

  const handleDeleteStudent = async (student) => {
    setDeleting(true)
    try {
      const id  = student._id || student.id
      const res = await adminStudentsAPI.delete(id)
      if (res.success) {
        showToast('Student removed', 'success')
        setStudents(prev => prev.filter(s => (s._id || s.id) !== id))
        setConfirmDelete(null)
      } else {
        showToast(res.message || 'Delete failed', 'error')
      }
    } catch { showToast('Network error', 'error') }
    finally  { setDeleting(false) }
  }

  const handleEditStudent = async (id, form) => {
    try {
      if (form.role) {
        const res = await adminStudentsAPI.changeRole(id, form.role)
        if (res.success) {
          setStudents(prev => prev.map(s => (s._id || s.id) === id ? { ...s, ...form } : s))
          showToast('Student updated', 'success')
          setEditingStudent(null)
        } else {
          showToast(res.message || 'Update failed', 'error')
        }
      }
    } catch { showToast('Network error', 'error') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Students</h2>
          <p className="text-xs text-[#6B6B6B]">{loading ? '...' : `${students.length} students on this page`}</p>
        </div>
        <button onClick={() => fetchStudents(page, search)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/8 flex items-center justify-center text-[#6B6B6B] hover:text-white transition-all" title="Refresh">
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#3B3B3B] focus:outline-none focus:border-[#9EFF00]/30 transition-colors"
        />
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <TableSkeleton /> : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Enrolled</th>
                  <th className="text-right text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {students.map(s => (
                  <tr key={s._id || s.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#9EFF00]/10 flex items-center justify-center text-xs font-bold text-[#9EFF00]">
                          {(s.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{s.name}</div>
                          <div className="text-xs text-[#6B6B6B]">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <span className="text-sm text-[#6B6B6B]">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        s.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-[#9EFF00]/10 text-[#9EFF00]'
                      }`}>
                        {s.role || 'student'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      <span className="text-sm text-[#6B6B6B] font-mono">{(s.enrolled || []).length} courses</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setEditingStudent(s)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#9EFF00]/10 hover:text-[#9EFF00] flex items-center justify-center text-[#6B6B6B] transition-all"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(s)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-[#6B6B6B] transition-all"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && students.length === 0 && (
            <div className="text-center py-12 text-[#6B6B6B] text-sm">
              {search ? 'No students match your search.' : 'No students found.'}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-xs text-[#6B6B6B]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-[#6B6B6B] hover:text-white hover:bg-white/8 disabled:opacity-30 transition-all"
              >Prev</button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-[#6B6B6B] hover:text-white hover:bg-white/8 disabled:opacity-30 transition-all"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            message={`Remove ${confirmDelete.name} from the platform? Their course access will be revoked.`}
            loading={deleting}
            onConfirm={() => handleDeleteStudent(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
        {editingStudent && (
          <StudentModal
            student={editingStudent}
            onSave={handleEditStudent}
            onClose={() => setEditingStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Notes Section ────────────────────────────────────────────────────────────
// Admin can add PDFs via Google Drive link. Students see a download button.
function NotesSection({ showToast }) {
  const [notes,         setNotes]         = useState([])
  const [courses,       setCourses]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterCourse,  setFilterCourse]  = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingNote,   setEditingNote]   = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  // ── Fetch notes from your API (adjust endpoint to match your backend) ──────
  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      // Replace with your actual notes API call, e.g. adminNotesAPI.list()
      // Expected shape: { success: true, data: { notes: [...] } }
      const res = await fetch('/api/admin/notes').then(r => r.json())
      if (res.success) setNotes(res.data?.notes || res.data?.items || [])
      else showToast(res.message || 'Failed to load notes', 'error')
    } catch {
      // Fallback: show empty state gracefully
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      const res = await coursesAPI.list({ per_page: 100 })
      if (res.success) setCourses(res.data.courses ?? res.data.items ?? [])
    } catch {}
  }, [])

  useEffect(() => { fetchNotes(); fetchCourses() }, [fetchNotes, fetchCourses])

  const getCourseTitle = (courseId) => {
    if (!courseId) return null
    const c = courses.find(c => (c._id || c.id) === courseId)
    return c ? `${c.emoji || '📚'} ${c.title}` : null
  }

  // ── Convert Drive view link → direct download link ────────────────────────
  const toDriveDownload = (link) => {
    if (!link) return link
    // https://drive.google.com/file/d/FILE_ID/view → /uc?export=download&id=FILE_ID
    const m = link.match(/\/file\/d\/([^/]+)/)
    if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`
    return link
  }

  const handleSave = async (formData, isNew, id) => {
    try {
      const payload = { ...formData }
      let res
      if (isNew) {
        res = await fetch('/api/admin/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(r => r.json())
      } else {
        res = await fetch(`/api/admin/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(r => r.json())
      }
      if (res.success) {
        showToast(isNew ? 'Notes added!' : 'Notes updated!', 'success')
        setModalOpen(false)
        setEditingNote(null)
        fetchNotes()
      } else {
        showToast(res.message || 'Save failed', 'error')
      }
    } catch { showToast('Network error', 'error') }
  }

  const handleDelete = async (note) => {
    setDeleting(true)
    try {
      const id  = note._id || note.id
      const res = await fetch(`/api/admin/notes/${id}`, { method: 'DELETE' }).then(r => r.json())
      if (res.success) {
        showToast('Notes deleted', 'success')
        setNotes(prev => prev.filter(n => (n._id || n.id) !== id))
        setConfirmDelete(null)
      } else {
        showToast(res.message || 'Delete failed', 'error')
      }
    } catch { showToast('Network error', 'error') }
    finally  { setDeleting(false) }
  }

  const toggleVisibility = async (note) => {
    const id         = note._id || note.id
    const newVisible = !note.visible
    setNotes(prev => prev.map(n => (n._id || n.id) === id ? { ...n, visible: newVisible } : n))
    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: newVisible }),
      }).then(r => r.json())
      if (!res.success) {
        setNotes(prev => prev.map(n => (n._id || n.id) === id ? { ...n, visible: note.visible } : n))
        showToast('Failed to update visibility', 'error')
      }
    } catch {
      setNotes(prev => prev.map(n => (n._id || n.id) === id ? { ...n, visible: note.visible } : n))
    }
  }

  const filtered = notes.filter(n => {
    const matchSearch = (n.title || '').toLowerCase().includes(search.toLowerCase()) ||
                        (n.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCourse = !filterCourse || n.courseId === filterCourse
    return matchSearch && matchCourse
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Notes</h2>
          <p className="text-xs text-[#6B6B6B]">{notes.length} notes files · students can download PDFs</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchNotes} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/8 flex items-center justify-center text-[#6B6B6B] hover:text-white transition-all" title="Refresh">
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => { setEditingNote(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9EFF00] text-black font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Add Notes
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#3B3B3B] focus:outline-none focus:border-[#9EFF00]/30 transition-colors"
          />
        </div>
        <select
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
          className="bg-[#111] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9EFF00]/30 transition-colors min-w-[160px]"
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.emoji || '📚'} {c.title}</option>
          ))}
        </select>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 text-xs text-blue-400 border rounded-xl bg-blue-500/5 border-blue-500/15">
        <FileText size={13} className="mt-0.5 flex-shrink-0" />
        <span>Paste Google Drive PDF links below. Make sure sharing is set to <strong>"Anyone with the link can view"</strong> so students can download the file.</span>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <TableSkeleton /> : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Notes</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Course</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Size</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3">Visible</th>
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Drive Link</th>
                  <th className="text-right text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map(n => (
                  <tr key={n._id || n.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500/10">
                          <FileText size={15} className="text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{n.title}</div>
                          {n.description && <div className="text-xs text-[#6B6B6B] mt-0.5 line-clamp-1">{n.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      {n.courseId
                        ? <span className="text-xs text-[#A0A0A0] bg-white/5 px-2.5 py-1 rounded-full">{getCourseTitle(n.courseId) || 'Unknown'}</span>
                        : <span className="text-xs text-[#4B4B4B]">General</span>
                      }
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <span className="text-xs text-[#6B6B6B] font-mono">{n.fileSize || '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleVisibility(n)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all ${
                          n.visible
                            ? 'bg-[#9EFF00]/10 text-[#9EFF00] hover:bg-[#9EFF00]/20'
                            : 'bg-white/5 text-[#6B6B6B] hover:bg-white/10'
                        }`}
                      >
                        {n.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                        {n.visible ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      {n.driveLink ? (
                        <a
                          href={n.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink size={11} />
                          <span className="truncate max-w-[160px]">Open Drive</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[#4B4B4B]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                        {/* Preview */}
                        {n.driveLink && (
                          <a
                            href={n.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/10 hover:text-blue-400 flex items-center justify-center text-[#6B6B6B] transition-all"
                            title="Preview"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {/* Download */}
                        {n.driveLink && (
                          <a
                            href={toDriveDownload(n.driveLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#9EFF00]/10 hover:text-[#9EFF00] flex items-center justify-center text-[#6B6B6B] transition-all"
                            title="Download"
                          >
                            <Download size={12} />
                          </a>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => { setEditingNote(n); setModalOpen(true) }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#9EFF00]/10 hover:text-[#9EFF00] flex items-center justify-center text-[#6B6B6B] transition-all"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        {/* Delete */}
                        <button
                          // onClick={() => setConfirmDelete(n)}
                          disabled={true}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-[#6B6B6B] transition-all"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-[#6B6B6B] text-sm">
              <FileText size={28} className="mx-auto mb-3 opacity-20" />
              {search || filterCourse ? 'No notes match your filters.' : 'No notes yet. Add your first PDF notes!'}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <NoteModal
            note={editingNote || {}}
            courses={courses}
            onSave={handleSave}
            onClose={() => { setModalOpen(false); setEditingNote(null) }}
          />
        )}
        {confirmDelete && (
          <ConfirmDialog
            message={`Delete "${confirmDelete.title}"? Students will lose access to this notes file.`}
            loading={deleting}
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Analytics Section ────────────────────────────────────────────────────────
function AnalyticsSection({ showToast }) {
  const [stats,   setStats]   = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.stats(),
      coursesAPI.list({ per_page: 100 }),
    ]).then(([statsRes, courseRes]) => {
      if (statsRes.success) setStats(statsRes.data)
      if (courseRes.success) setCourses(courseRes.data.courses ?? courseRes.data.items ?? [])
    }).catch(() => showToast('Failed to load analytics', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const ov = stats?.overview || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Analytics</h2>
        <p className="text-xs text-[#6B6B6B]">Platform performance from database</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-[#111] border border-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Students"  value={fmt(ov.total_students)}    icon={Users}    trend={8}  accent="#9EFF00" />
          <StatCard label="Total Courses"   value={fmt(ov.total_courses)}     icon={BookOpen} trend={0}  accent="#60A5FA" />
          <StatCard label="Total Reviews"   value={fmt(ov.total_reviews)}     icon={Star}     trend={5}  accent="#A78BFA" />
          <StatCard label="Enrollments"     value={fmt(ov.total_enrollments)} icon={Award}    trend={12} accent="#FBBF24" />
        </div>
      )}

      {stats?.top_courses?.length > 0 && (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h3 className="mb-6 text-sm font-semibold text-white">Top Courses by Enrollment</h3>
          <div className="space-y-4">
            {stats.top_courses.map((tc, i) => {
              const max = stats.top_courses[0]?.enrollments || 1
              return (
                <div key={tc.course_id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm text-white">{tc.emoji || '📚'} {tc.title}</span>
                    <span className="text-[#9EFF00] font-mono font-semibold text-sm">{fmt(tc.enrollments)} enrolled</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(tc.enrollments / max) * 100}%` }}
                      transition={{ delay: i * 0.08, duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `rgba(158,255,0,${1 - i * 0.12})` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {courses.length > 0 && (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Course Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Course</th>
                  <th className="text-right text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3">Students</th>
                  <th className="text-right text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-4 py-3">Rating</th>
                  <th className="text-right text-xs font-medium text-[#6B6B6B] uppercase tracking-wider px-5 py-3">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {courses.map(c => (
                  <tr key={c._id || c.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span>{c.emoji || '📚'}</span>
                        <span className="text-sm text-white">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#6B6B6B] font-mono">{fmt(c.students)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-sm text-amber-400">
                        <Star size={11} className="fill-amber-400" />{c.rating || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-[#9EFF00] font-mono">
                      {fmtPrice(c.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Settings Section ─────────────────────────────────────────────────────────
function SettingsSection({ showToast }) {
  const [settings, setSettings] = useState({
    siteName:            'Skill-Zone-Acadmey',
    siteTagline:         'Learn to Code. Build the Future.',
    supportEmail:        'support@Skill-Zone.com',
    phoneNumber:         '+91 98765 43210',
    razorpayEnabled:     true,
    discordLink:         'https://discord.gg/Skill-Zone',
    twitterHandle:       '@Skill-Zone',
    youtubeChannel:      'Skill-Zone-Academy',
    maintenanceMode:     false,
    autoEnrollOnPayment: true,
    emailNotifications:  true,
    gstEnabled:          true,
    gstNumber:           '27AABCS1429B1ZB',
    defaultDiscount:     0,
    allowRefunds:        true,
    refundWindow:        7,
  })
  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = () => showToast('Settings saved!', 'success')

  const Toggle = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#A0A0A0]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 transition-colors rounded-full"
        style={{ width: 40, height: 22, background: checked ? '#9EFF00' : 'rgba(255,255,255,0.1)' }}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-transform shadow ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )

  const SectionBox = ({ title, children }) => (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
      <h3 className="pb-3 mb-4 text-sm font-semibold text-white border-b border-white/5">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )

  const LabeledInput = ({ label, hint, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={baseCls}
      />
      {hint && <p className="text-xs text-[#4B4B4B] mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <p className="text-xs text-[#6B6B6B]">Manage platform configuration</p>
        </div>
        <button
          // onClick={handleSave}
          disabled={true}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#9EFF00] text-black font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
        >
          <Save size={14} /> Save All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionBox title="🏫 General">
          <LabeledInput label="Site Name"     value={settings.siteName}     onChange={v => set('siteName', v)} />
          <LabeledInput label="Tagline"       value={settings.siteTagline}  onChange={v => set('siteTagline', v)} />
          <LabeledInput label="Support Email" value={settings.supportEmail} onChange={v => set('supportEmail', v)} type="email" />
          <LabeledInput label="Phone"         value={settings.phoneNumber}  onChange={v => set('phoneNumber', v)} />
        </SectionBox>

        <SectionBox title="📱 Social Links">
          <LabeledInput label="Discord"    value={settings.discordLink}    onChange={v => set('discordLink', v)} />
          <LabeledInput label="Twitter / X" value={settings.twitterHandle} onChange={v => set('twitterHandle', v)} />
          <LabeledInput label="YouTube"    value={settings.youtubeChannel} onChange={v => set('youtubeChannel', v)} />
        </SectionBox>

        <SectionBox title="💳 Payments & GST">
          <Toggle checked={settings.razorpayEnabled} onChange={v => set('razorpayEnabled', v)} label="Razorpay Payment Gateway" />
          <Toggle checked={settings.gstEnabled}      onChange={v => set('gstEnabled', v)}      label="GST on Purchases" />
          {settings.gstEnabled && <LabeledInput label="GST Number" value={settings.gstNumber} onChange={v => set('gstNumber', v)} />}
          <LabeledInput label="Default Discount (%)" hint="Applied at checkout automatically" type="number" value={settings.defaultDiscount} onChange={v => set('defaultDiscount', v)} placeholder="0" />
          <Toggle checked={settings.allowRefunds} onChange={v => set('allowRefunds', v)} label="Allow Refunds" />
          {settings.allowRefunds && (
            <LabeledInput label="Refund Window (days)" type="number" value={settings.refundWindow} onChange={v => set('refundWindow', v)} placeholder="7" />
          )}
        </SectionBox>

        <SectionBox title="⚙️ Platform Behavior">
          <Toggle checked={settings.autoEnrollOnPayment} onChange={v => set('autoEnrollOnPayment', v)} label="Auto-enroll on Payment" />
          <Toggle checked={settings.emailNotifications}  onChange={v => set('emailNotifications', v)}  label="Email Notifications" />
          <Toggle checked={settings.maintenanceMode}     onChange={v => set('maintenanceMode', v)}      label="Maintenance Mode" />
          {settings.maintenanceMode && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs border rounded-lg text-amber-400 bg-amber-500/10 border-amber-500/20">
              <AlertTriangle size={12} /> Maintenance mode will block public access.
            </div>
          )}
        </SectionBox>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onExit }) {
  const [activeSection, setActiveSection] = useState('overview')
  const [toast,         setToast]         = useState(null)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3200)
  }, [])

  const navItems = [
    { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
    { id: 'courses',   label: 'Courses',   icon: BookOpen },
    { id: 'students',  label: 'Students',  icon: Users },
    { id: 'notes',     label: 'Notes',     icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings',  label: 'Settings',  icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex font-body text-[#F0F0F0]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:relative z-50 lg:z-auto
        w-56 min-h-screen bg-[#0D0D0D] border-r border-white/5
        flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#9EFF00] rounded-lg flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-black">S</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Skill-Zone</div>
              <div className="text-[10px] text-[#9EFF00] font-mono">admin panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeSection === item.id
                  ? 'bg-[#9EFF00]/10 text-[#9EFF00] font-semibold'
                  : 'text-[#6B6B6B] hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#6B6B6B] hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={15} /> Back to Site
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10" onClick={() => setSidebarOpen(true)}>
              <Menu size={16} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white capitalize">{activeSection}</h1>
              <p className="text-xs text-[#4B4B4B] hidden sm:block">Skill-Zone Admin Panel · Live DB</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#9EFF00] animate-pulse" title="Connected to DB" />
            <span className="text-xs text-[#9EFF00] font-mono hidden sm:block">DB Connected</span>
            <div className="flex items-center gap-2 pl-3 border-l border-white/5">
              <div className="w-7 h-7 rounded-lg bg-[#9EFF00]/15 flex items-center justify-center text-xs font-bold text-[#9EFF00]">S</div>
              <span className="text-xs text-[#6B6B6B] hidden sm:block">SHUBHAM</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'overview'  && <OverviewSection  showToast={showToast} />}
              {activeSection === 'courses'   && <CoursesSection   showToast={showToast} />}
              {activeSection === 'students'  && <StudentsSection  showToast={showToast} />}
              {activeSection === 'notes'     && <NotesSection     showToast={showToast} />}
              {activeSection === 'analytics' && <AnalyticsSection showToast={showToast} />}
              {activeSection === 'settings'  && <SettingsSection  showToast={showToast} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  )
}