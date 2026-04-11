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

---

### 🎤 Voice Guidance
- Audio feedback for accessibility

---

### 📊 Dashboard
- Tracks test performance and activity

---

### 🎨 Smart Color Utilities
- Color naming
- CVD simulation
- Accessibility scoring

---

## 🛠️ Tech Stack

- React + Vite  
- Tailwind CSS  
- React Router DOM  
- Context API  

---

## 📁 Project Structure
## 🧠 System Architecture

## 🧠 System Architecture

```mermaid
flowchart TD

    U[User]

    subgraph UI_Layer
        UI1[Pages]
        UI2[Components]
        UI3[Routing]
    end

    subgraph Core_Features
        F1[Ishihara Test]
        F2[Camera Detection]
        F3[Voice Guidance]
        F4[Dashboard]
    end

    subgraph Logic_Layer
        L1[Scoring Engine]
        L2[CVD Simulation]
        L3[Color Processing]
    end

    subgraph Data_Layer
        D1[LocalStorage]
        D2[Test Data]
    end

    U --> UI1
    UI1 --> F1
    UI1 --> F2
    UI1 --> F3
    UI1 --> F4

    F1 --> L1
    F2 --> L3
    F3 --> L3
    F4 --> L1

    L1 --> D1
    L2 --> D2
    L3 --> D1
---

## 📸 Feature Showcase

### 🧪 Color Blindness Test
<img src="https://raw.githubusercontent.com/Dixa08/Chroma-Aid/main/img/picture1.jpeg" width="600">

### 🎯 User Answer Selection
<img src="https://raw.githubusercontent.com/Dixa08/Chroma-Aid/main/img/picture2.jpeg" width="600">
<img src="https://raw.githubusercontent.com/Dixa08/Chroma-Aid/main/img/picture3.jpeg" width="600">

### 💡 Recommendations
<img src="https://raw.githubusercontent.com/Dixa08/Chroma-Aid/main/img/picture4.jpeg" width="600">

### 📷 Camera Detection
<img src="https://raw.githubusercontent.com/Dixa08/Chroma-Aid/main/img/picture5.jpeg" width="600">

### 📊  how normal and cvd see the image 
<img src="https://raw.githubusercontent.com/Dixa08/Chroma-Aid/main/img/picture6.jpeg" width="600">

### 🎤 colour detection Voice Assistance
<img src="https://raw.githubusercontent.com/Dixa08/Chroma-Aid/main/img/picture7.jpeg" width="600">

---

## ⚙️ Installation

```bash
git clone https://github.com/Dixa08/Chroma-Aid.git
cd Chroma-Aid
npm install
npm run dev
