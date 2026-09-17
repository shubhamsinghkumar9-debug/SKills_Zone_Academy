import { Github, Youtube, Instagram, Twitter, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

const footerLinks = {
  Courses: [
    'MS Office (Word, Excel, PPT)',
    'Tally & GST',
    'Web Designing',
    'Programming (C, C++, Java, Python)',
    'Graphic Designing (Photoshop, CorelDRAW)',
    'Digital Marketing'
  ],
  Company: [
    'About Skills Zone Academy',
    'Our Courses',
    'Admissions',
    'Contact Us',
    'Location'
  ],
  Resources: [
    'Computer Basics',
    'Practical Training',
    'Certification Info',
    'Student Projects',
    'Career Guidance'
  ],
  Legal: [
    'Terms & Conditions',
    'Privacy Policy',
    'Refund Policy',
    'Admission Policy'
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brand-gray">
      <div className="px-6 py-16 mx-auto max-w-7xl">

        {/* Top */}
        <div className="grid grid-cols-2 gap-12 mb-16 md:grid-cols-3 lg:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center h-8 rounded-lg w-28 bg-brand-green">
                <span className="font-mono text-sm font-bold text-brand-dark">SKILLS ZONE</span>
              </div>
              <span className="text-lg font-semibold text-white">Academy</span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-brand-muted">
              Complete computer education & practical training institute. 
              Learn job-ready skills with expert guidance.
            </p>

            {/* Contact Info */}
            <div className="mb-6 space-y-2 text-sm text-brand-muted">
              <p className="flex items-center gap-2">
                <MapPin size={14} /> Opp. Vaishno Mata Mandir, Jhankar Road, Qutub Vihar, Delhi
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} /> +91 7065070309 / 7781819858
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { Icon: Youtube, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Github, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex items-center justify-center transition-colors border rounded-lg w-9 h-9 glass text-brand-muted hover:text-brand-green hover:border-brand-green/20 border-white/5"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-4 text-sm font-semibold text-white">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors text-brand-muted hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

    
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t sm:flex-row border-white/5">
          <p className="text-sm text-brand-muted">
            © {new Date().getFullYear()} Skills Zone Academy. All rights reserved.
          </p>

          <p className="text-brand-muted text-sm flex items-center gap-1.5">
            Made by{' '}
            <span className="relative">
              <span className="text-brand-green">Shubham_kr._Singh</span>
              <motion.svg
                className="absolute left-0 w-full -bottom-2"
                viewBox="0 0 200 10"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <path
                  d="M2 7 Q50 2 100 7 Q150 12 198 7"
                  stroke="#9EFF00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.svg>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}