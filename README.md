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




## 📸 Feature Showcase

### 🧪 Color Blindness Test
![Test UI](./img/picture1.jpeg)

### 🎯 User Answer Selection
![Selection](./img/picture2.jpeg)

### 📊 Result Screen
![Result](./img/picture3.jpeg)

### 💡 Recommendations
![Recommendations](./img/picture4.jpeg)

### 📷 Camera Detection
![Camera](./img/picture5.jpeg)

### 📊 Dashboard
![Dashboard](./img/picture6.jpeg)

### 🎤 Voice Assistance
![Voice](./img/picture7.jpeg)


---


