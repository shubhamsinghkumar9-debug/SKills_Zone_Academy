import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, User } from 'lucide-react'
import CallbackModal from './CallbackModal'
import SignInModal from './SignInModal'
import ReviewModal from './ReviewModal'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Courses',   href: '#courses' },
  { label: 'About',     href: '#about' },
  { label: 'Community', href: '#community' },
  { label: 'Review',    href: '#review',  modal: 'review' },
  { label: 'Contact',   href: '#contact', modal: 'callback' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [callbackOpen,  setCallbackOpen]  = useState(false)
  const [signInOpen,    setSignInOpen]    = useState(false)
  const [reviewOpen,    setReviewOpen]    = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (link, e) => {
    if (link.modal === 'callback') { e.preventDefault(); setMenuOpen(false); setCallbackOpen(true) }
    else if (link.modal === 'review') { e.preventDefault(); setMenuOpen(false); setReviewOpen(true) }
    else setMenuOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className={"fixed top-0 left-0 right-0 z-50 transition-all duration-500 " + (scrolled ? 'py-3 glass border-b border-white/5' : 'py-5 bg-transparent')}
      >
        <div className="flex items-center justify-between px-6 mx-auto max-w-7xl">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-24 h-8 rounded-lg bg-brand-green">
              <span className="font-mono text-sm font-bold text-brand-dark">Skills-Zone</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Academy</span>
          </a>

          <nav className="items-center hidden gap-8 md:flex">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} onClick={(e) => handleNavClick(link, e)}
                className="relative text-sm transition-colors duration-200 cursor-pointer text-brand-muted hover:text-white group">
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-green group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="items-center hidden gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <User size={14} className="text-brand-green" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-brand-green/20 text-brand-green rounded-full font-mono">ADMIN</span>
                  )}
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-red-400 transition-colors">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setSignInOpen(true)} className="text-sm transition-colors text-brand-muted hover:text-white">Sign In</button>
                <a href="#courses" className="btn-primary bg-brand-green text-brand-dark text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">Get Started →</a>
              </>
            )}
          </div>

          <button className="p-1 text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }} className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-brand-dark/98 md:hidden">
            {navLinks.map((link, i) => (
              <motion.a key={link.label} href={link.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} className="text-2xl font-semibold text-white transition-colors cursor-pointer hover:text-brand-green"
                onClick={(e) => handleNavClick(link, e)}>
                {link.label}
              </motion.a>
            ))}
            {user ? (
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.07 }} onClick={() => { setMenuOpen(false); logout() }}
                className="text-xl text-red-400 transition-colors hover:text-red-300">
                Sign Out
              </motion.button>
            ) : (
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.07 }} className="text-xl transition-colors text-brand-muted hover:text-white"
                onClick={() => { setMenuOpen(false); setSignInOpen(true) }}>
                Sign In
              </motion.button>
            )}
            <motion.a href="#courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (navLinks.length + 1) * 0.07 }}
              className="px-8 py-3 text-lg font-bold rounded-full bg-brand-green text-brand-dark" onClick={() => setMenuOpen(false)}>
              Get Started →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <CallbackModal  isOpen={callbackOpen} onClose={() => setCallbackOpen(false)} />
      <SignInModal    isOpen={signInOpen}   onClose={() => setSignInOpen(false)} />
      <ReviewModal    isOpen={reviewOpen}   onClose={() => setReviewOpen(false)} />
    </>
  )
}