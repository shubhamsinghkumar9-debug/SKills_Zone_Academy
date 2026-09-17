import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Courses from './components/Courses'
import About from './components/About'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import AdminDashboard from './components/AdminDashboard'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  if (isAdmin) {
    return <AdminDashboard onExit={() => setIsAdmin(false)} />
  }

  return (
    <div className="noise-bg min-h-screen bg-brand-dark text-brand-light">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Courses />
        <About />
        <Testimonials />
        <CTA />
      </main>
      <Footer />

      {/* Admin gear — only visible when logged in as admin */}
      {user?.role === 'admin' && (
        <button
          onClick={() => setIsAdmin(true)}
          title="Open Admin Panel"
          className="fixed bottom-5 right-5 z-50 w-9 h-9 rounded-xl bg-[#141414] border border-white/8 flex items-center justify-center opacity-50 hover:opacity-100 transition-all hover:border-[#9EFF00]/30 hover:bg-[#9EFF00]/5"
        >
          <span className="text-[11px] text-[#9EFF00] font-mono font-bold">⚙</span>
        </button>
      )}
    </div>
  )
}
