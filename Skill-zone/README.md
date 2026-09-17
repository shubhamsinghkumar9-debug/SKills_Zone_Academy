# Sheryians Coding School — Clone

A pixel-perfect React + Tailwind CSS + Framer Motion clone of [sheryians.com](https://sheryians.com/).

## 🚀 Tech Stack

- **React 18** — UI framework
- **Vite** — blazing-fast dev server & bundler
- **Tailwind CSS v3** — utility-first styling
- **Framer Motion** — animations & scroll reveals
- **Lucide React** — icon library

## 📁 Project Structure

```
sheryians-clone/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Sticky nav with mobile menu
│   │   ├── Hero.jsx          # Landing hero with floating cards
│   │   ├── Marquee.jsx       # Infinite scrolling ticker
│   │   ├── Courses.jsx       # Course cards grid
│   │   ├── About.jsx         # Stats + about with counters
│   │   ├── Testimonials.jsx  # Student testimonials grid
│   │   ├── CTA.jsx           # Call-to-action banner
│   │   └── Footer.jsx        # Full footer with links
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css             # Tailwind + global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## ⚡ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production

```bash
npm run build
```

## 🎨 Design Highlights

- **Color palette**: Acid green (`#9EFF00`) on deep black (`#0A0A0A`)
- **Typography**: DM Sans (body) + JetBrains Mono (accents)
- **Animations**: Framer Motion scroll reveals, staggered card entrances, animated SVG underlines
- **Infinite marquee**: Pure CSS animation ticker
- **Animated counters**: Count-up effect triggered on scroll
- **Glassmorphism cards**: Frosted glass UI throughout
- **Noise overlay**: Subtle grain texture for depth
- **Responsive**: Fully mobile-first design

## 📦 Dependencies

```json
{
  "framer-motion": "^11.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.383.0"
}
```

---

Built with ❤️ inspired by Sheryians Coding School
