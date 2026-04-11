# 🌈 Chroma Aid

**Chroma Aid** is a modern web application designed to assist users with color vision deficiencies. It provides interactive Ishihara tests, real-time color detection, and accessibility-focused tools to improve everyday color perception.

---

## 🚀 Features

### 🧪 Color Blindness Test
- Interactive Ishihara-style test
- Detects:
  - Normal Vision
  - Protanopia (Red deficiency)
  - Deuteranopia (Green deficiency)
  - Tritanopia (Blue deficiency)
- Displays:
  - Accuracy score
  - Confidence level
  - Result explanation

---

### 📷 Real-Time Color Detection
- Uses camera to detect colors
- Displays closest color name
- Helpful for daily object identification

---

### 🎤 Voice Guidance
- Audio feedback for accessibility
- Assists visually impaired users

---

### 📊 Dashboard
- Tracks:
  - Tests taken
  - Scores
  - Activity overview

---

### 🎨 Smart Color Utilities
- Color naming
- Color transformation using CVD matrices
- Accessibility scoring

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **State Management:** Context API
- **Utilities:** Custom color engine logic

---

## 📁 Project Structure
## 🧩 Project Structure (Visual)

```mermaid
graph TD
    A[chroma-aid] --> B[public]
    B --> B1[index.html]

    A --> C[src]

    C --> D[pages]
    D --> D1[Landing.jsx]
    D --> D2[Test.jsx]
    D --> D3[Camera.jsx]
    D --> D4[Dashboard.jsx]
    D --> D5[Results.jsx]

    C --> E[components]
    E --> E1[Navbar.jsx]
    E --> E2[IshiharaPlate.jsx]
    E --> E3[VoiceGuide.jsx]
    E --> E4[ColourDetector.jsx]

    C --> F[utils]
    F --> F1[colourNames.js]
    F --> F2[cvdMatrices.js]
    F --> F3[scoring.js]

    C --> G[App.jsx]
    C --> H[main.jsx]

    A --> I[README.md]
    A --> J[package.json]
    A --> K[vite.config.js]



## 🧠 Chroma Aid System Architecture (Detailed)

```mermaid
flowchart TD

    %% USER
    U[User] --> UI

    %% FRONTEND LAYER
    subgraph UI[Frontend - React App]
        PAGES[Pages Layer]
        COMPONENTS[Reusable Components]
        ROUTER[React Router]

        PAGES --> COMPONENTS
        ROUTER --> PAGES
    end

    %% CORE FEATURES
    subgraph FEATURES[Core Features]
        TEST[Ishihara Test System]
        CAMERA[Camera Color Detection]
        VOICE[Voice Guidance]
        DASH[Dashboard Analytics]
    end

    UI --> FEATURES

    %% LOGIC LAYER
    subgraph LOGIC[Application Logic Layer]
        SCORING[Scoring Engine]
        CVD[Color Vision Simulation]
        COLOR[Color Recognition Engine]
    end

    FEATURES --> LOGIC

    %% DATA LAYER
    subgraph DATA[Data Layer]
        LOCAL[LocalStorage]
        STATIC[Static Test Data]
    end

    LOGIC --> DATA

    %% OUTPUT
    DATA --> RESULT[Results & Insights]
    RESULT --> UI
