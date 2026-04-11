<div align="center">

# 🎨 Chroma Aid

### *See the World in Full Colour*

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/hackathon-2024-orange?style=for-the-badge)

**A free, mobile-first web application for Colour Vision Deficiency (CVD) detection, real-time colour assistance, and personalised accessibility.**

[🌐 Live Demo](https://YOUR-LINK-HERE) · [📹 Demo Video](https://YOUR-VIDEO-LINK) · [📊 Presentation](https://YOUR-PPT-LINK)

---

</div>

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [CVD Types Detected](#-cvd-types-detected)
- [Ishihara Test Logic](#-ishihara-test-logic)
- [Getting Started](#-getting-started)
- [Team](#-team)

---

## 🔴 The Problem

> *"1 in 12 men and 1 in 200 women worldwide have Colour Vision Deficiency — and most of them don't even know it."*

| Problem | Impact |
|---------|--------|
| No free screening tool | Millions undiagnosed |
| EnChroma glasses cost $300+ | Unaffordable for most |
| No awareness in schools | Children struggle silently |
| Colour-coded world | Daily life challenges |
| No real-time colour aid | Can't identify colours independently |

**300 million people** are affected globally. In India alone, over **15 million** people have CVD — most without diagnosis.

---

## ✅ Our Solution

**Chroma Aid** is a completely free, browser-based tool that requires **no download, no account, no expensive hardware.**

```
Open phone → Take test → Know your CVD type → 
Get personalised help → Live independently
```

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CHROMA AID                           │
│                   Web Application Layer                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   CVD TESTING   │ │  REAL-TIME  │ │  PERSONALISATION│
│     ENGINE      │ │  ASSISTANCE │ │     ENGINE      │
└────────┬────────┘ └──────┬──────┘ └────────┬────────┘
         │                 │                  │
    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
    │Ishihara │       │  Live   │       │Dashboard│
    │ Plates  │       │ Camera  │       │ Colours │
    │Generator│       │         │       │ Adapted │
    └────┬────┘       └────┬────┘       └────┬────┘
         │                 │                  │
    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
    │ Canvas  │       │  Voice  │       │   CVD   │
    │   API   │       │Commands │       │ Filters │
    └────┬────┘       └────┬────┘       └────┬────┘
         │                 │                  │
    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
    │Scoring &│       │Web Speech│      │ SVG     │
    │ Result  │       │   API   │       │ Matrix  │
    └────┬────┘       └────┬────┘       └─────────┘
         │                 │
    ┌────▼─────────────────▼────┐
    │        localStorage       │
    │    (User Profile + Data)  │
    └───────────────────────────┘
```

### User Journey Flow

```
  USER OPENS APP
       │
       ▼
  LANDING PAGE
       │
       ▼
  ┌────────────┐
  │  NEW USER? │
  └─────┬──────┘
     YES│              NO
        │               │
        ▼               ▼
   TAKE TEST      DASHBOARD
        │               │
        ▼               │
  ┌─────────────┐       │
  │  PHASE 1    │       │
  │  Screening  │       │
  │  6 plates   │       │
  └─────┬───────┘       │
        │               │
        ▼               │
  ┌─────────────┐       │
  │  PHASE 2    │       │
  │ Classify    │       │
  │ Protan/     │       │
  │ Deutan/     │       │
  │ Tritan      │       │
  └─────┬───────┘       │
        │               │
        ▼               │
  ┌─────────────┐       │
  │  PHASE 3    │       │
  │  Severity   │       │
  │  Mild/Mod/  │       │
  │  Severe     │       │
  └─────┬───────┘       │
        │               │
        ▼               │
  ┌─────────────────────┴──┐
  │   PERSONALISED DASHBOARD│
  │   Colours adapted to    │
  │   user's CVD type       │
  └──────────┬──────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
 CAMERA   IMAGE    COLOUR
 ASSIST  ANALYSIS  GAMES
    │        │        │
    ▼        ▼        ▼
 VOICE    CVD SIM   DAILY
COMMANDS  FILTERS  CHALLENGE
```

---

## ✨ Features

### 1. 🔬 Ishihara Colour Vision Test
- 20 scientifically designed plates
- Generated programmatically using Canvas API
- Detects CVD presence, type, and severity
- Results in under 3 minutes

### 2. 🎤 Voice-Guided Camera Assist
- Say *"What colour is this?"* — phone answers
- Say *"Start scanning"* — continuous colour reading
- Say *"Scan the whole image"* — describes all regions
- Hands-free, works while working or cooking

### 3. 🖼 Image Analysis
- Upload any photo
- See how CVD users see it
- Drag-to-compare: Normal vs CVD vision
- Extract dominant colours automatically

### 4. 🎨 Personalised Dashboard
- UI colours adapt to user's CVD type
- Protan users → red removed from UI
- Deutan users → green replaced with purple
- Severe CVD → patterns + text labels added

### 5. 🎮 Colour Games
- Colour matching game
- Shade sorting challenge
- Name that colour

### 6. 🗣 Multilingual Voice Support
- English, Hindi, Spanish, French
- Full TTS and voice recognition

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | UI framework |
| Styling | Tailwind CSS | Dark theme design |
| Animation | Framer Motion | Page transitions |
| Icons | Lucide React | UI icons |
| Plates | Canvas API | Ishihara generation |
| Camera | getUserMedia API | Live video feed |
| Voice in | Web Speech API | Voice commands |
| Voice out | SpeechSynthesis API | Colour announcements |
| CVD filters | SVG feColorMatrix | Vision simulation |
| Storage | localStorage | User data, no backend |
| Deployment | Vercel | Live hosting |

---

## 🔬 How It Works

### Ishihara Plate Generation

```
1. Create 400x400 canvas
2. Clip to circle shape
3. Place 400 random dots (radius 3-6px)
4. Map each dot to a 7x5 bitmap grid
5. If dot falls on number path → Figure colour
   If dot falls on background → Background colour
6. Figure colours:  #C84F25 #D4562A #E05A2B
   Background:      #7AAF3C #8DB84A #9DC455
7. Add ±15 random RGB variation per dot
8. Result: realistic Ishihara-style plate
```

### Colour Detection (Camera)

```
1. User says "what colour is this"
2. App captures current video frame
3. Draws frame to hidden canvas
4. Reads pixel RGBA at tap/center point
5. Calculates distance to 50 named colours
6. Picks closest match
7. Speaks: "This is Forest Green, hex 228B22"
```

### CVD Simulation (Image Analysis)

```
Normal vision → no filter applied

Protan filter matrix:
[ 0.567  0.433  0     ]
[ 0.558  0.442  0     ]
[ 0      0.242  0.758 ]

Deutan filter matrix:
[ 0.625  0.375  0     ]
[ 0.7    0.3    0     ]
[ 0      0.3    0.7   ]

Tritan filter matrix:
[ 0.95   0.05   0     ]
[ 0      0.433  0.567 ]
[ 0      0.475  0.525 ]
```

---

## 👁 CVD Types Detected

| Type | Cone Affected | Prevalence | What They See |
|------|--------------|------------|---------------|
| Deuteranomaly | Green (shifted) | 5% males | Reds + greens look similar |
| Deuteranopia | Green (absent) | 1% males | Cannot distinguish red/green |
| Protanomaly | Red (shifted) | 1% males | Reds appear washed out |
| Protanopia | Red (absent) | 1% males | Reds appear near-black |
| Tritanomaly | Blue (shifted) | 0.01% | Blues + greens confused |
| Tritanopia | Blue (absent) | 0.003% | Blues look green |
| Achromatopsia | No cones | Very rare | Only grey shades |

---

## 📊 Scoring Logic

```
Plates 1-6   → Transformation plates (screening)
Plates 7-10  → Vanishing plates (severity)
Plates 11-12 → Hidden digit (confirmation)
Plates 13-16 → Diagnostic (Protan vs Deutan)
Plates 17-18 → Tritan detection
Plates 19-20 → Severity grading

Score:
0-2 wrong  → ✅ Normal colour vision
3-5 wrong  → 🟡 Mild CVD
6-8 wrong  → 🟠 Moderate CVD
9+ wrong   → 🔴 Severe CVD

Type detection:
Errors on red plates  → Protan
Errors on green plates → Deutan  
Errors on blue plates  → Tritan
```

---

## 🚀 Getting Started

### Run locally

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/chroma-aid.git

# Go into folder
cd chroma-aid

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:5173
```

### Or just open the live link

👉 **[chroma-aid.vercel.app](https://YOUR-LINK-HERE)**

No installation. Works on any phone or computer.
Use **Chrome** for best voice recognition support.

---

## 📁 Project Structure

```
chroma-aid/
│
├── public/
│   └── index.html
│
├── src/
│   ├── pages/
│   │   ├── Landing.jsx       # Home page
│   │   ├── Test.jsx          # Ishihara test
│   │   ├── Camera.jsx        # Live camera + voice
│   │   ├── ImageAnalysis.jsx # Upload + CVD sim
│   │   ├── Dashboard.jsx     # User home
│   │   ├── Results.jsx       # Test results
│   │   ├── Profile.jsx       # User profile
│   │   └── ColourExplorer.jsx
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── IshiharaPlate.jsx # Canvas plate gen
│   │   ├── VoiceGuide.jsx    # Voice commands
│   │   └── ColourDetector.jsx
│   │
│   ├── utils/
│   │   ├── colourNames.js    # 50 colour library
│   │   ├── cvdMatrices.js    # Filter matrices
│   │   └── scoring.js        # Test scoring logic
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── README.md
├── package.json
└── vite.config.js
```

---

## 🆚 Why Chroma Aid

| | EnChroma Glasses | Clinical Test | Other Apps | **Chroma Aid** |
|--|-----------------|---------------|------------|----------------|
| Cost | $300+ | Doctor visit | Free | **Free** |
| Accessibility | Buy online | Hospital only | App install | **Any browser** |
| Detection | No | Yes | Basic | **Full + type** |
| Real-time help | Yes | No | No | **Yes + voice** |
| Personalisation | No | No | No | **Full UI adapt** |
| Works on phone | No | No | Some | **Yes** |
| Voice guidance | No | No | No | **Yes** |

---

## 👥 Team Chroma crew


**Built at:** YOUR HACKATHON NAME 2024
**Category:** Accessibility / Health Tech

---

## 📄 License

MIT License — free to use, modify and share.

---

<div align="center">

**Made with ❤️ for 300 million people who see the world differently**

[⭐ Star this repo](https://github.com/YOUR-USERNAME/chroma-aid) if you found it useful!

</div>
