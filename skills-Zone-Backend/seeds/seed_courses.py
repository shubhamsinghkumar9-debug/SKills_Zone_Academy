"""
Run with:  python seeds/seed_courses.py
Requires MONGO_URI in .env (or defaults to localhost)
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()

import datetime
from extensions import get_db

db = get_db()
db_name = getattr(db, "name", "sheryians")


courses = [
    {
        "id":          "fed",
        "emoji":       "⚡",
        "tag":         "BESTSELLER",
        "tagColor":    "amber",
        "title":       "Front-End Domination",
        "subtitle":    "Create Anything with Code",
        "desc":        "Master HTML, CSS, GSAP animations, ScrollTrigger, Locomotive Scroll and build award-winning websites.",
        "longDesc":    "This is India's most comprehensive front-end course. You will go from zero to building animation-heavy, production-ready websites that look like they cost ₹50,000+. Every lesson is packed with live coding, design thinking, and real-world projects.",
        "instructor":  "Harsh Sharma",
        "instructorRole": "Founder, Sheryians",
        "rating":      "4.9",
        "students":    "18,400+",
        "hours":       "80+",
        "updated":     "Feb 2025",
        "price":       "₹4,999",
        "originalPrice": "₹12,999",
        "gradient":    "from-yellow-500/25 to-orange-500/10",
        "accent":      "#F59E0B",
        "features":    ["Lifetime access", "Certificate", "Source code", "Discord community", "Project reviews"],
        "curriculum": [
            {
                "section": "Foundation",
                "lessons": [
                    {"title": "HTML5 Semantics & Structure", "duration": "42 min", "type": "video"},
                    {"title": "CSS Reset & Box Model Mastery", "duration": "55 min", "type": "video"},
                    {"title": "Flexbox Deep Dive",            "duration": "68 min", "type": "video"},
                    {"title": "CSS Grid — Complete Guide",    "duration": "72 min", "type": "video"},
                    {"title": "HTML & CSS Notes",             "duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "GSAP Animations",
                "lessons": [
                    {"title": "GSAP Setup & Tweens",        "duration": "52 min", "type": "video"},
                    {"title": "GSAP Timelines",             "duration": "64 min", "type": "video"},
                    {"title": "ScrollTrigger Masterclass",  "duration": "90 min", "type": "video"},
                    {"title": "Pin & Scrub Animations",     "duration": "75 min", "type": "video"},
                    {"title": "GSAP Reference Guide",       "duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "Real Projects",
                "lessons": [
                    {"title": "Project 1 — Agency Landing Page", "duration": "3.5 hr",  "type": "project"},
                    {"title": "Project 2 — Product Showcase",    "duration": "2.8 hr",  "type": "project"},
                    {"title": "Project 3 — Portfolio Website",   "duration": "4 hr",    "type": "project"},
                    {"title": "Project Assets & Figma Files",    "duration": "ZIP",     "type": "pdf"},
                ],
            },
        ],
        "notes": [
            {"title": "HTML & CSS Complete Notes",   "pages": 48, "size": "3.2 MB"},
            {"title": "Flexbox & Grid Cheatsheet",   "pages": 12, "size": "890 KB"},
            {"title": "GSAP Reference Guide",        "pages": 32, "size": "2.1 MB"},
            {"title": "ScrollTrigger Cookbook",      "pages": 24, "size": "1.6 MB"},
            {"title": "Project Source Code & Assets","pages": None,"size": "128 MB"},
        ],
        "reviews": [
            {"name": "Arjun M.", "role": "Got placed @ Infosys", "rating": 5,
             "text": "Best animation course in India. Period."},
            {"name": "Sneha P.", "role": "Freelancer ₹80k/month", "rating": 5,
             "text": "I built my portfolio with this course and landed 3 international clients."},
        ],
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
    },
    {
        "id":          "react",
        "emoji":       "⚛️",
        "tag":         "TRENDING",
        "tagColor":    "blue",
        "title":       "React JS Mastery",
        "subtitle":    "Modern Frontend Development",
        "desc":        "Deep dive into React hooks, context, Redux, Next.js and build production-grade applications.",
        "longDesc":    "Go from understanding JSX to shipping full-scale React apps. Covers hooks, Redux Toolkit, Zustand, Next.js App Router, and 5 real projects.",
        "instructor":  "Harsh Sharma",
        "instructorRole": "Founder, Sheryians",
        "rating":      "4.8",
        "students":    "12,100+",
        "hours":       "60+",
        "updated":     "Jan 2025",
        "price":       "₹3,999",
        "originalPrice": "₹9,999",
        "gradient":    "from-blue-500/25 to-cyan-500/10",
        "accent":      "#3B82F6",
        "features":    ["Lifetime access", "Certificate", "Source code", "Community support", "5 projects"],
        "curriculum": [
            {
                "section": "React Fundamentals",
                "lessons": [
                    {"title": "JSX & Component Basics", "duration": "45 min", "type": "video"},
                    {"title": "Props & Children",        "duration": "38 min", "type": "video"},
                    {"title": "State & Events",          "duration": "55 min", "type": "video"},
                    {"title": "React Fundamentals Notes","duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "Hooks Deep Dive",
                "lessons": [
                    {"title": "useState & useEffect",           "duration": "70 min", "type": "video"},
                    {"title": "useRef, useMemo, useCallback",   "duration": "65 min", "type": "video"},
                    {"title": "Custom Hooks",                   "duration": "50 min", "type": "video"},
                    {"title": "Hooks Reference Sheet",          "duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "Next.js",
                "lessons": [
                    {"title": "App Router & Pages",            "duration": "60 min", "type": "video"},
                    {"title": "Server & Client Components",    "duration": "55 min", "type": "video"},
                    {"title": "API Routes & Data Fetching",    "duration": "72 min", "type": "video"},
                    {"title": "Next.js Cheatsheet",            "duration": "PDF",    "type": "pdf"},
                ],
            },
        ],
        "notes": [
            {"title": "React Fundamentals Notes", "pages": 36, "size": "2.4 MB"},
            {"title": "Hooks Complete Reference", "pages": 28, "size": "1.8 MB"},
            {"title": "Redux Toolkit Guide",      "pages": 20, "size": "1.3 MB"},
            {"title": "Next.js Cheatsheet",       "pages": 16, "size": "1.1 MB"},
        ],
        "reviews": [
            {"name": "Divya N.", "role": "SDE @ Flipkart",  "rating": 5, "text": "The hooks section is phenomenal."},
            {"name": "Mohit Y.", "role": "Frontend Dev",    "rating": 5, "text": "Next.js module is gold."},
        ],
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
    },
    {
        "id":          "fullstack",
        "emoji":       "🌐",
        "tag":         "POPULAR",
        "tagColor":    "green",
        "title":       "Full Stack Development",
        "subtitle":    "Node.js + MongoDB + React",
        "desc":        "Complete full-stack journey — REST APIs, auth, databases, deployment and scalable architecture.",
        "longDesc":    "The most complete course to become a full-stack developer. Node.js, Express, MongoDB, JWT, React frontend. Deploy on AWS and Vercel.",
        "instructor":  "Harsh Sharma",
        "instructorRole": "Founder, Sheryians",
        "rating":      "4.9",
        "students":    "9,200+",
        "hours":       "120+",
        "updated":     "Mar 2025",
        "price":       "₹6,999",
        "originalPrice": "₹18,999",
        "gradient":    "from-green-500/25 to-emerald-500/10",
        "accent":      "#9EFF00",
        "features":    ["Lifetime access", "Certificate", "AWS deployment guide", "Community", "6 projects"],
        "curriculum": [
            {
                "section": "Node.js & Express",
                "lessons": [
                    {"title": "Node.js Fundamentals",     "duration": "55 min", "type": "video"},
                    {"title": "Express.js & Routing",     "duration": "65 min", "type": "video"},
                    {"title": "Middleware & Error Handling","duration": "48 min","type": "video"},
                    {"title": "Node.js Reference Guide",  "duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "MongoDB & Mongoose",
                "lessons": [
                    {"title": "MongoDB Atlas Setup",          "duration": "25 min", "type": "video"},
                    {"title": "Mongoose Schemas & Models",    "duration": "60 min", "type": "video"},
                    {"title": "CRUD Operations",              "duration": "55 min", "type": "video"},
                    {"title": "MongoDB Cheatsheet",           "duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "Authentication",
                "lessons": [
                    {"title": "JWT Authentication",           "duration": "70 min", "type": "video"},
                    {"title": "Refresh Tokens & Security",   "duration": "58 min", "type": "video"},
                    {"title": "OAuth with Google",            "duration": "45 min", "type": "video"},
                ],
            },
        ],
        "notes": [
            {"title": "Node.js & Express Complete Notes", "pages": 52, "size": "3.6 MB"},
            {"title": "MongoDB Mongoose Guide",           "pages": 30, "size": "2.0 MB"},
            {"title": "JWT Auth Implementation",          "pages": 18, "size": "1.2 MB"},
            {"title": "Deployment & DevOps Guide",        "pages": 22, "size": "1.5 MB"},
        ],
        "reviews": [
            {"name": "Priya S.", "role": "Full Stack @ Razorpay", "rating": 5,
             "text": "Finally a course that teaches full stack the way companies build things."},
        ],
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
    },
    {
        "id":          "threejs",
        "emoji":       "🔷",
        "tag":         "NEW",
        "tagColor":    "purple",
        "title":       "Three.js & WebGL",
        "subtitle":    "3D Web Experiences",
        "desc":        "Create immersive 3D web experiences with Three.js, WebGL shaders, and modern GPU-based rendering.",
        "longDesc":    "Build the kind of 3D websites that go viral. Three.js from ground up — scene, cameras, lighting, materials, then GLSL shaders and post-processing.",
        "instructor":  "Harsh Sharma",
        "instructorRole": "Founder, Sheryians",
        "rating":      "4.7",
        "students":    "4,300+",
        "hours":       "40+",
        "updated":     "Dec 2024",
        "price":       "₹3,499",
        "originalPrice": "₹8,999",
        "gradient":    "from-purple-500/25 to-violet-500/10",
        "accent":      "#A855F7",
        "features":    ["Lifetime access", "Certificate", "Shader starter kit", "4 projects"],
        "curriculum": [
            {
                "section": "Three.js Basics",
                "lessons": [
                    {"title": "Scene, Camera, Renderer", "duration": "45 min", "type": "video"},
                    {"title": "Geometries & Materials",  "duration": "55 min", "type": "video"},
                    {"title": "Lighting & Shadows",      "duration": "50 min", "type": "video"},
                    {"title": "Three.js Quick Reference","duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "GLSL Shaders",
                "lessons": [
                    {"title": "Vertex Shaders",   "duration": "65 min", "type": "video"},
                    {"title": "Fragment Shaders", "duration": "70 min", "type": "video"},
                    {"title": "Shader Cookbook",  "duration": "PDF",    "type": "pdf"},
                ],
            },
        ],
        "notes": [
            {"title": "Three.js Complete Guide",  "pages": 44, "size": "2.8 MB"},
            {"title": "GLSL Shader Cookbook",     "pages": 26, "size": "1.7 MB"},
        ],
        "reviews": [
            {"name": "Aditya R.", "role": "Creative Dev", "rating": 5,
             "text": "Went from never touching 3D to building a shader-heavy portfolio in 3 weeks."},
        ],
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
    },
    {
        "id":          "dsa",
        "emoji":       "🎯",
        "tag":         "ADVANCED",
        "tagColor":    "cyan",
        "title":       "DSA with JavaScript",
        "subtitle":    "Crack Top Tech Companies",
        "desc":        "Arrays, trees, graphs, dynamic programming — crack FAANG interviews with confidence using JavaScript.",
        "longDesc":    "The only DSA course in India taught entirely in JavaScript. 200+ problems with visual animations and time/space complexity analysis.",
        "instructor":  "Harsh Sharma",
        "instructorRole": "Founder, Sheryians",
        "rating":      "4.8",
        "students":    "7,600+",
        "hours":       "50+",
        "updated":     "Jan 2025",
        "price":       "₹2,999",
        "originalPrice": "₹7,499",
        "gradient":    "from-cyan-500/25 to-teal-500/10",
        "accent":      "#06B6D4",
        "features":    ["Lifetime access", "Certificate", "200+ problems", "Interview Q&A PDF"],
        "curriculum": [
            {
                "section": "Foundations",
                "lessons": [
                    {"title": "Big O Notation",     "duration": "40 min", "type": "video"},
                    {"title": "Arrays & Strings",   "duration": "75 min", "type": "video"},
                    {"title": "Big O Cheatsheet",   "duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "Data Structures",
                "lessons": [
                    {"title": "Linked Lists",              "duration": "65 min", "type": "video"},
                    {"title": "Stacks & Queues",           "duration": "55 min", "type": "video"},
                    {"title": "Trees & BST",               "duration": "80 min", "type": "video"},
                    {"title": "Graphs",                    "duration": "70 min", "type": "video"},
                    {"title": "Data Structures Notes",     "duration": "PDF",    "type": "pdf"},
                ],
            },
            {
                "section": "Algorithms",
                "lessons": [
                    {"title": "Sorting Algorithms",        "duration": "60 min", "type": "video"},
                    {"title": "Dynamic Programming",       "duration": "90 min", "type": "video"},
                    {"title": "Algorithm Patterns Guide",  "duration": "PDF",    "type": "pdf"},
                ],
            },
        ],
        "notes": [
            {"title": "DSA Complete Notes (200 pages)",  "pages": 200,"size": "12 MB"},
            {"title": "Big O Complexity Cheatsheet",     "pages": 8,  "size": "520 KB"},
            {"title": "Top 50 Interview Questions",      "pages": 40, "size": "2.6 MB"},
            {"title": "LeetCode Pattern Guide",          "pages": 32, "size": "2.1 MB"},
        ],
        "reviews": [
            {"name": "Vikram S.", "role": "SDE @ Amazon",    "rating": 5, "text": "Cracked my Amazon SDE interview after this course."},
            {"name": "Neha G.",   "role": "SDE @ Microsoft", "rating": 5, "text": "Best DSA in JS course on the internet."},
        ],
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
    },
    {
        "id":          "cohort",
        "emoji":       "🚀",
        "tag":         "COHORT",
        "tagColor":    "rose",
        "title":       "Cohort 2.0",
        "subtitle":    "Live Mentorship Program",
        "desc":        "Join a live batch with Harsh Sharma. Personal mentorship, peer learning, and real-world projects.",
        "longDesc":    "The flagship live program. Weekly sessions, 1:1 doubt clearing, code reviews, mock interviews, and placement support.",
        "instructor":  "Harsh Sharma",
        "instructorRole": "Founder, Sheryians",
        "rating":      "5.0",
        "students":    "2,800+",
        "hours":       "Live",
        "updated":     "Ongoing",
        "price":       "₹14,999",
        "originalPrice": "₹29,999",
        "gradient":    "from-rose-500/25 to-pink-500/10",
        "accent":      "#F43F5E",
        "features":    ["Live sessions", "1:1 mentorship", "Code reviews", "Mock interviews", "Placement support", "Certificate"],
        "curriculum": [
            {
                "section": "Month 1 — Frontend",
                "lessons": [
                    {"title": "Week 1: HTML/CSS Sprint",       "duration": "Live", "type": "video"},
                    {"title": "Week 2: JavaScript Deep Dive",  "duration": "Live", "type": "video"},
                    {"title": "Week 3: React Fundamentals",    "duration": "Live", "type": "video"},
                    {"title": "Week 4: Project Build",         "duration": "Live", "type": "project"},
                    {"title": "Month 1 Notes Bundle",          "duration": "PDF",  "type": "pdf"},
                ],
            },
            {
                "section": "Month 2 — Full Stack",
                "lessons": [
                    {"title": "Week 5: Node.js & Express",     "duration": "Live", "type": "video"},
                    {"title": "Week 6: MongoDB & Auth",        "duration": "Live", "type": "video"},
                    {"title": "Week 7: Full Stack Project",    "duration": "Live", "type": "project"},
                    {"title": "Week 8: Deployment",            "duration": "Live", "type": "video"},
                ],
            },
        ],
        "notes": [
            {"title": "Cohort 2.0 Full Notes Bundle", "pages": 280,  "size": "18 MB"},
            {"title": "Interview Prep Handbook",       "pages": 60,   "size": "4.2 MB"},
            {"title": "Project Briefs & Resources",   "pages": None,  "size": "240 MB"},
        ],
        "reviews": [
            {"name": "Ananya K.", "role": "Placed @ TCS Digital",  "rating": 5,
             "text": "Got placed in just 2 months after cohort."},
            {"name": "Sumit R.",  "role": "Freelancer ₹2L/month",  "rating": 5,
             "text": "Cohort community is unreal. We help each other even now."},
        ],
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
    },
]


def seed():
    db.courses.create_index("id", unique=True)
    inserted = 0
    skipped  = 0
    for c in courses:
        try:
            db.courses.insert_one(c)
            inserted += 1
            print(f"  ✅  Inserted: {c['title']}")
        except Exception:
            skipped += 1
            print(f"  ⚠️   Skipped (already exists): {c['title']}")
    print(f"\nDone. Inserted {inserted}, skipped {skipped}.")


if __name__ == "__main__":
    print(f"Seeding courses into '{db_name}'...")
    seed()
