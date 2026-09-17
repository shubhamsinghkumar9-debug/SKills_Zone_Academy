export default function Marquee() {
  const items = [
    '⚡  MS OFFICE (WORDS,EXCELS,PPT)',
    '🎨 TALLY & GST',
    '⚛️ WEB DESIGNING',
    '🟢 PROGRAMMING',
    '🎬 C, C++, JAVA, PYTHON',
    '🚂 GRAPHIC DESIGNING',
    '🗄️ PS, corelDRAW',
    '🔷 DIGITAL MARKETING',
    
  ]

  const doubled = [...items, ...items]

  return (
    <div className="relative py-5 my-4 overflow-hidden border-y border-white/5 bg-brand-gray">
      <div className="marquee-container">
        <div className="gap-12 px-6 marquee-inner">
          {doubled.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 mr-12 text-sm font-medium text-brand-muted whitespace-nowrap"
            >
              {item}
              <span className="text-brand-green/30">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
