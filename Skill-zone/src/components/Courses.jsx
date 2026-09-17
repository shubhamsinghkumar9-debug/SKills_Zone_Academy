import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Clock, Users, Star, ArrowUpRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { coursesAPI } from '../api/index.js'
import CoursePage from './CoursePage'

const tagColors = {
  amber:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  blue:   'bg-blue-500/20 text-blue-400 border-blue-500/20',
  green:  'bg-brand-green/20 text-brand-green border-brand-green/20',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  cyan:   'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
  rose:   'bg-rose-500/20 text-rose-400 border-rose-500/20',
  red:    'bg-red-500/20 text-red-400 border-red-500/20',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
}

// Format price: backend stores numbers, we display ₹
function fmtPrice(val) {
  if (!val && val !== 0) return ''
  if (typeof val === 'string' && val.startsWith('₹')) return val
  return `₹${Number(val).toLocaleString('en-IN')}`
}

function CourseCard({ course, index, onClick }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className="relative flex flex-col overflow-hidden transition-colors border cursor-pointer card-hover group glass rounded-2xl border-white/5 hover:border-white/10"
    >
      <div className={`h-32 bg-gradient-to-br ${course.gradient || 'from-green-500/25 to-emerald-500/10'} relative flex items-center justify-center`}>
        <span className="text-5xl">{course.emoji || '📚'}</span>
        {course.tag && (
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full border ${tagColors[course.tagColor] || tagColors.green}`}>
            {course.tag}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div>
          <h3 className="text-lg font-bold leading-tight text-white">{course.title}</h3>
          <p className="text-brand-muted text-xs mt-0.5 mb-3">{course.subtitle}</p>
          <p className="mb-4 text-sm leading-relaxed text-white/60 line-clamp-3">{course.desc}</p>
        </div>

        <div className="flex items-center gap-4 mt-auto mb-5 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <Users size={11} /> {course.students?.toLocaleString?.() ?? course.students ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {course.hours} hrs
          </span>
          <span className="flex items-center gap-1">
            <Star size={11} fill="#9EFF00" className="text-brand-green" /> {course.rating}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <span className="text-lg font-bold text-white">{fmtPrice(course.price)}</span>
            <span className="ml-2 text-xs line-through text-brand-muted">{fmtPrice(course.originalPrice)}</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark bg-brand-green px-4 py-2 rounded-full hover:opacity-90 transition-opacity group-hover:scale-105 transition-transform">
            View <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function SkeletonCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden border rounded-2xl border-white/5"
    >
      <div className="h-32 bg-white/5 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="w-3/4 h-5 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-1/2 h-3 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-3 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-5/6 h-3 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-8 mt-6 rounded-lg bg-white/5 animate-pulse" />
      </div>
    </motion.div>
  )
}

export default function Courses() {
  const titleRef    = useRef(null)
  const titleInView = useInView(titleRef, { once: true })

  const [courses, setCourses]               = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await coursesAPI.list({ per_page: 50 })
      if (res.success) {
        setCourses(res.data.courses ?? res.data.items ?? [])
      } else {
        setError(res.message || 'Failed to load courses')
      }
    } catch (e) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  return (
    <>
      <section id="courses" className="px-6 py-24 mx-auto max-w-7xl">
        <div ref={titleRef} className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="block mb-4 font-mono text-xs tracking-widest uppercase text-brand-green"
          >
            — Our Curriculum
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-4 text-4xl font-bold leading-tight text-white md:text-6xl"
          >
            Courses built for
            <br />
            <span className="text-gradient">real-world builders</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto text-lg text-brand-muted"
          >
            Click any course to explore curriculum, download notes and enroll.
          </motion.p>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-white/60">{error}</p>
            <button
              onClick={fetchCourses}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-black font-semibold rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Course grid */}
        {!loading && !error && (
          <>
            {courses.length === 0 ? (
              <div className="py-16 text-sm text-center text-white/40">
                No courses available yet. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, i) => (
                  <CourseCard
                    key={course._id || course.id}
                    course={course}
                    index={i}
                    onClick={() => setSelectedCourse(course)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <AnimatePresence>
        {selectedCourse && (
          <CoursePage
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
