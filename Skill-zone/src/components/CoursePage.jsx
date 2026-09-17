import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Star, Clock, Users, BookOpen, Download, Play,
  ChevronDown, ChevronUp, FileText, FolderOpen, Award,
  CheckCircle, Lock, Zap, Globe, Loader2
} from 'lucide-react'
import { coursesAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'

const typeIcon = (type) => {
  if (type === 'pdf')     return <FileText size={13} className="text-orange-400" />
  if (type === 'project') return <FolderOpen size={13} className="text-brand-green" />
  return <Play size={13} className="text-blue-400" />
}

const tagColors = {
  amber:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  green:  'bg-brand-green/15 text-brand-green border-brand-green/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  rose:   'bg-rose-500/15 text-rose-400 border-rose-500/20',
  red:    'bg-red-500/15 text-red-400 border-red-500/20',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
}

function fmtPrice(val) {
  if (!val && val !== 0) return ''
  if (typeof val === 'string' && val.startsWith('₹')) return val
  return `₹${Number(val).toLocaleString('en-IN')}`
}

function discountPct(price, originalPrice) {
  const p  = typeof price === 'string'         ? parseInt(price.replace(/[^0-9]/g, ''))         : price
  const op = typeof originalPrice === 'string' ? parseInt(originalPrice.replace(/[^0-9]/g, '')) : originalPrice
  if (!p || !op || op === 0) return null
  return Math.round((1 - p / op) * 100)
}

function CurriculumSection({ section, idx }) {
  const [open, setOpen] = useState(idx === 0)
  const pdfs     = (section.lessons || []).filter(l => l.type === 'pdf').length
  const videos   = (section.lessons || []).filter(l => l.type === 'video').length
  const projects = (section.lessons || []).filter(l => l.type === 'project').length

  return (
    <div className="mb-3 overflow-hidden border border-white/6 rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">{section.section}</span>
          <div className="flex gap-2">
            {videos  > 0 && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{videos} videos</span>}
            {pdfs    > 0 && <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">{pdfs} PDFs</span>}
            {projects> 0 && <span className="text-[10px] text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">{projects} projects</span>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-white/40 shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-white/5">
              {(section.lessons || []).map((lesson, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 shrink-0">
                      {typeIcon(lesson.type)}
                    </div>
                    <span className="text-sm transition-colors text-white/70 group-hover:text-white">{lesson.title}</span>
                    {lesson.type === 'pdf' && (
                      <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-mono">PDF</span>
                    )}
                    {lesson.type === 'project' && (
                      <span className="text-[10px] bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded font-mono">PROJECT</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-white/30">{lesson.duration}</span>
                    {lesson.type === 'pdf' ? (
                      lesson.url ? (
                        <a
                          href={lesson.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-orange-400 border border-orange-500/20 rounded-full px-2.5 py-1 hover:bg-orange-500/10"
                        >
                          <Download size={10} /> Download
                        </a>
                      ) : (
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-orange-400 border border-orange-500/20 rounded-full px-2.5 py-1 hover:bg-orange-500/10">
                          <Download size={10} /> Download
                        </button>
                      )
                    ) : (
                      <Lock size={12} className="text-white/20" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NotesTab({ notes, accent }) {
  if (!notes || notes.length === 0) {
    return <p className="py-8 text-sm text-center text-white/40">No notes available for this course yet.</p>
  }
  return (
    <div className="space-y-3">
      <p className="mb-5 text-sm text-white/40">
        All notes are available after enrollment. Preview first pages are free.
      </p>
      {notes.map((note, i) => (
        <div key={i} className="flex items-center justify-between glass border border-white/6 rounded-xl px-4 py-3.5 group hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg w-9 h-9 shrink-0" style={{ background: `${accent || '#9EFF00'}15` }}>
              <FileText size={16} style={{ color: accent || '#9EFF00' }} />
            </div>
            <div>
              <div className="text-sm font-medium text-white">{note.title}</div>
              <div className="text-white/35 text-xs mt-0.5">{note.pages ? `${note.pages} pages` : note.size || 'PDF'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/25 font-mono mr-2">{note.size || ''}</span>
            {note.url ? (
              <a
                href={note.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:border-white/20 hover:text-white transition-all"
              >
                <Download size={11} /> Download
              </a>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-white/20 border border-white/8 rounded-full px-2.5 py-1">
                <Lock size={10} /> Enrolled only
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewsTab({ reviews, courseId }) {
  const [dbReviews, setDbReviews] = useState(reviews || [])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    coursesAPI.getReviews(courseId, { per_page: 20 })
      .then(res => {
        if (res.success) setDbReviews(res.data.items || res.data.reviews || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [courseId])

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 size={20} className="text-white/30 animate-spin" />
    </div>
  )

  if (!dbReviews || dbReviews.length === 0) {
    return <p className="py-8 text-sm text-center text-white/40">No reviews yet. Enroll and be the first to review!</p>
  }

  return (
    <div className="space-y-4">
      {dbReviews.map((review, i) => (
        <div key={review._id || i} className="p-4 border glass border-white/6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center text-xs font-bold rounded-full w-7 h-7 bg-brand-green/15 text-brand-green">
                {(review.name || 'U')[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{review.name || 'Anonymous'}</div>
                <div className="text-white/30 text-[11px]">
                  {review.created_at ? new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} size={12} fill={j < (review.rating || 5) ? '#9EFF00' : 'transparent'} className={j < (review.rating || 5) ? 'text-brand-green' : 'text-white/20'} />
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/60">{review.text}</p>
        </div>
      ))}
    </div>
  )
}

export default function CoursePage({ course: initialCourse, onClose }) {
  const { user }  = useAuth()
  const [tab, setTab]         = useState('overview')
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled]   = useState(false)
  const [enrollMsg, setEnrollMsg] = useState(null)
  const [course, setCourse]       = useState(initialCourse)
  const [detailLoading, setDetailLoading] = useState(false)

  const courseId = course._id || course.id

  // Fetch fresh course details from backend
  useEffect(() => {
    if (!courseId) return
    setDetailLoading(true)
    coursesAPI.get(courseId)
      .then(res => {
        if (res.success && res.data?.course) setCourse(res.data.course)
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false))

    // Check enrollment
    if (user) {
      coursesAPI.getEnrollment(courseId)
        .then(res => { if (res.success) setEnrolled(true) })
        .catch(() => {})
    }
  }, [courseId, user])

  const curriculum = course.curriculum || []
  const notes      = course.notes      || []
  const reviews    = course.reviews    || []
  const features   = course.features   || []

  const totalLessons = curriculum.reduce((a, s) => a + (s.lessons?.length || 0), 0)
  const totalPDFs    = curriculum.reduce((a, s) => a + (s.lessons?.filter(l => l.type === 'pdf').length || 0), 0)

  const tabs = ['overview', 'curriculum', 'notes', 'reviews']

  const handleEnroll = async () => {
    if (!user) { setEnrollMsg('Please sign in to enroll.'); return }
    if (enrolled) { setEnrollMsg('You are already enrolled!'); return }
    setEnrolling(true)
    setEnrollMsg(null)
    try {
      const res = await coursesAPI.enroll(courseId)
      if (res.success) {
        setEnrolled(true)
        setEnrollMsg('🎉 Enrolled successfully!')
      } else {
        setEnrollMsg(res.message || 'Enrollment failed.')
      }
    } catch {
      setEnrollMsg('Network error. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const pct = discountPct(course.price, course.originalPrice)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/80 backdrop-blur-sm md:items-center md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full md:max-w-5xl bg-[#0E0E0E] rounded-t-3xl md:rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Loading overlay for fresh fetch */}
        {detailLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0E0E0E]/70 rounded-2xl">
            <Loader2 size={24} className="text-brand-green animate-spin" />
          </div>
        )}

        {/* Header */}
        <div
          className={`relative px-6 md:px-8 pt-8 pb-6 bg-gradient-to-br ${course.gradient || 'from-green-500/25 to-emerald-500/10'} shrink-0`}
        >
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center w-8 h-8 transition-all rounded-full top-4 right-4 bg-black/30 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/50"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4">
            <div className="text-5xl md:text-6xl shrink-0">{course.emoji || '📚'}</div>
            <div className="flex-1 min-w-0">
              {course.tag && (
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border mb-2 ${tagColors[course.tagColor] || tagColors.green}`}>
                  {course.tag}
                </span>
              )}
              <h2 className="text-xl font-bold leading-tight text-white md:text-2xl">{course.title}</h2>
              <p className="mt-1 text-sm text-white/60">{course.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <Star size={12} fill="#9EFF00" className="text-brand-green" />
              <span className="font-semibold text-white">{course.rating}</span> rating
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={12} />
              {course.students?.toLocaleString?.() ?? course.students ?? 0} students
            </span>
            <span className="flex items-center gap-1.5"><Clock size={12} />{course.hours} hours</span>
            <span className="flex items-center gap-1.5"><BookOpen size={12} />{totalLessons} lessons · {totalPDFs} PDFs</span>
            {course.updated && <span className="flex items-center gap-1.5"><Globe size={12} />Updated {course.updated}</span>}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/6 px-6 md:px-8 shrink-0 bg-[#0E0E0E]">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative py-3.5 px-4 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'text-white' : 'text-white/35 hover:text-white/60'
              }`}
            >
              {t}
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col h-full md:flex-row">

            {/* Main */}
            <div className="flex-1 px-6 py-6 overflow-y-auto md:px-8">

              {tab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <h3 className="mb-3 text-lg font-bold text-white">About this course</h3>
                  <p className="mb-6 text-sm leading-relaxed text-white/55">{course.longDesc || course.desc}</p>

                  {features.length > 0 && (
                    <>
                      <h3 className="mb-3 text-base font-bold text-white">What you'll get</h3>
                      <div className="grid grid-cols-1 gap-2 mb-6 sm:grid-cols-2">
                        {features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-white/65">
                            <CheckCircle size={14} className="text-brand-green shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <h3 className="mb-3 text-base font-bold text-white">Your instructor</h3>
                  <div className="flex items-center gap-3 p-4 border glass border-white/6 rounded-xl">
                    <div className="flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full bg-brand-green text-brand-dark shrink-0">
                      {(course.instructor || 'H')[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{course.instructor || 'Harsh Sharma'}</div>
                      <div className="text-xs text-white/40">{course.instructorRole || 'Founder, Skill-Zone'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={11} fill="#9EFF00" className="text-brand-green" />
                        <span className="text-xs text-white/40">4.9 instructor rating · 50,000+ students</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {tab === 'curriculum' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Course Curriculum</h3>
                    <span className="text-xs text-white/35">{totalLessons} lessons</span>
                  </div>
                  {curriculum.length === 0 ? (
                    <p className="py-8 text-sm text-center text-white/40">Curriculum coming soon.</p>
                  ) : (
                    curriculum.map((section, i) => (
                      <CurriculumSection key={i} section={section} idx={i} />
                    ))
                  )}
                </motion.div>
              )}

              {tab === 'notes' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white">Course Notes & PDFs</h3>
                    <span className="text-xs text-white/35">{notes.length} resources</span>
                  </div>
                  <NotesTab notes={notes} accent={course.accent} />
                </motion.div>
              )}

              {tab === 'reviews' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white">{course.rating || '—'}</div>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="#9EFF00" className="text-brand-green" />
                        ))}
                      </div>
                      <div className="mt-1 text-xs text-white/35">Course Rating</div>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map(n => (
                        <div key={n} className="flex items-center gap-2 mb-1">
                          <div className="w-2 text-xs text-white/30">{n}</div>
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-green"
                              style={{ width: n === 5 ? '82%' : n === 4 ? '13%' : '5%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ReviewsTab reviews={reviews} courseId={courseId} />
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="px-6 pb-6 md:w-72 md:px-5 md:py-6 md:border-l border-white/5 shrink-0">
              <div className="sticky top-0 space-y-4">
                <div className="p-5 border glass border-white/8 rounded-2xl">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white">{fmtPrice(course.price)}</span>
                    <span className="text-sm line-through text-white/35">{fmtPrice(course.originalPrice)}</span>
                  </div>
                  {pct && <span className="text-xs font-semibold text-brand-green">{pct}% OFF</span>}

                  {enrollMsg && (
                    <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${enrolled ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-400'}`}>
                      {enrollMsg}
                    </div>
                  )}

                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || enrolled}
                    className="w-full mt-4 py-3.5 rounded-xl font-bold text-brand-dark text-sm bg-brand-green hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : enrolled ? (
                      <><CheckCircle size={15} /> Enrolled</>
                    ) : (
                      <><Zap size={15} /> Enroll Now</>
                    )}
                  </button>

                  <button className="w-full py-3 mt-2 text-sm font-medium transition-all border rounded-xl text-white/60 border-white/8 hover:border-white/15 hover:text-white">
                    Try 1 Free Lesson
                  </button>
                  <p className="text-white/25 text-[11px] text-center mt-3">30-day money-back guarantee</p>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-medium tracking-wider uppercase text-white/40">This course includes</p>
                  {[
                    { icon: <Play size={13} />,     label: `${course.hours || '—'} hrs on-demand video` },
                    { icon: <FileText size={13} />, label: `${notes.length} downloadable PDFs` },
                    { icon: <Award size={13} />,    label: 'Certificate of completion' },
                    { icon: <Globe size={13} />,    label: 'Lifetime access' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-white/55 text-xs">
                      <span style={{ color: course.accent || '#9EFF00' }}>{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>

                <button className="w-full text-xs text-white/30 hover:text-white/50 transition-colors border border-white/5 rounded-lg py-2.5">
                  Share this course ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
