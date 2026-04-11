import { useState, useEffect } from 'react';
import { Palette, Wand2, Paintbrush, Layers, Contrast, Eye } from 'lucide-react';
import { getAccessibilityScore } from '../utils/accessibility';
import { getComplementary, getAnalogous, simulateCVD } from '../utils/colorEngine';
import { useAppContext } from '../context/AppContext';

const ColorAssist = () => {
  const { userData } = useAppContext();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [bgColor, setBgColor] = useState('#0f172a');
  
  const accScore = getAccessibilityScore(primaryColor, bgColor);
  const compColor = getComplementary(primaryColor);
  const analogColors = getAnalogous(primaryColor);
  
  // Simulation uses users set CVD type or defaults to deuteranopia if normal
  const simType = userData.cvdType === "Normal Vision" ? "Deuteranopia" : userData.cvdType;
  const simPrimary = simulateCVD(primaryColor, simType);
  const simBg = simulateCVD(bgColor, simType);

  const presets = [
    { name: "Professional UI", primary: "#3b82f6", bg: "#f8fafc" },
    { name: "Warm Theme", primary: "#f59e0b", bg: "#451a03" },
    { name: "Cool Dark Mode", primary: "#818cf8", bg: "#0f172a" },
    { name: "High Contrast", primary: "#ffff00", bg: "#000000" }
  ];

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
             <Wand2 className="text-primary-500" size={32} /> Smart Color Assist
          </h1>
          <p className="text-slate-400 mt-2">Generate accessible, beautiful color palettes instantly.</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-xl flex gap-3 text-sm overflow-x-auto w-full md:w-auto p-2 scrollbar-none">
          {presets.map(p => (
            <button 
              key={p.name}
              onClick={() => { setPrimaryColor(p.primary); setBgColor(p.bg); }}
              className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg whitespace-nowrap border border-dark-600 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col - Editor */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Paintbrush size={20} className="text-slate-400" /> Color Picker
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Foreground (Primary)</span>
                  <span className="font-mono text-slate-400">{primaryColor}</span>
                </label>
                <div className="flex gap-3 h-12">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg bg-dark-800 border border-dark-600 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 input-field font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Background</span>
                  <span className="font-mono text-slate-400">{bgColor}</span>
                </label>
                <div className="flex gap-3 h-12">
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={e => setBgColor(e.target.value)}
                    className="w-12 h-12 p-1 rounded-lg bg-dark-800 border border-dark-600 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="flex-1 input-field font-mono uppercase"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-xl border border-dark-700 bg-dark-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2"><Contrast size={16}/> WCAG Score</span>
                <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                  accScore.isPass ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>{accScore.grade}</span>
              </div>
              <div className="flex items-end justify-between">
                 <span className="text-3xl font-light">{accScore.ratio}<span className="text-sm text-slate-500 ml-1">:1</span></span>
                 <span className={`text-sm ${accScore.isPass ? 'text-green-400' : 'text-red-400'}`}>{accScore.label}</span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl">
             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Layers size={20} className="text-slate-400" /> Theory Generated
            </h2>
            <div className="space-y-4">
               <div>
                 <p className="text-xs text-slate-500 mb-2">Complementary</p>
                 <div className="flex h-10 rounded-lg overflow-hidden border border-dark-700">
                    <div className="flex-1 flex items-center justify-center text-xs font-mono" style={{backgroundColor: primaryColor, color: bgColor}}>{primaryColor}</div>
                    <div className="flex-1 flex items-center justify-center text-xs font-mono" style={{backgroundColor: compColor, color: '#000'}}>{compColor}</div>
                 </div>
               </div>
               <div>
                 <p className="text-xs text-slate-500 mb-2">Analogous (Harmony)</p>
                 <div className="flex h-10 rounded-lg overflow-hidden border border-dark-700">
                    {analogColors.map((c, i) => (
                       <div key={i} className="flex-1 text-transparent hover:text-black/50 transition-colors flex items-center justify-center text-xs font-mono" style={{backgroundColor: c}}>{c}</div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Col - Live Preview */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col">
             <div className="p-4 border-b border-dark-700 bg-dark-800/80 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Live UI Preview</span>
             </div>
             <div className="flex-1 p-8 grid place-items-center relative" style={{ backgroundColor: bgColor }}>
                {/* Simulated Content Card */}
                <div className="w-full max-w-sm rounded-2xl p-8 shadow-2xl relative" style={{ backgroundColor: 'transparent' }}>
                   {/* Backdrop blur to make it readable if it's glass */}
                   <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 z-0"></div>
                   
                   <div className="relative z-10 flex flex-col items-center text-center">
                     <div className="w-16 h-16 rounded-full mb-4 shadow-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Palette size={24} style={{ color: bgColor }} />
                     </div>
                     <h3 className="text-2xl font-bold mb-2 transition-colors" style={{ color: primaryColor }}>
                        Dynamic UI Card
                     </h3>
                     <p className="text-sm opacity-80 mb-8" style={{ color: primaryColor }}>
                        The text color adapts to your chosen primary hue, ensuring this reads beautifully on the dynamic background.
                     </p>
                     <button className="w-full py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: primaryColor, color: bgColor }}>
                        Primary Action
                     </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between gap-4">
             <div>
                <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                   <Eye size={18} className="text-slate-400"/> {simType} Simulation
                </h3>
                <p className="text-sm text-slate-500">How colors appear to a user with {simType}</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-dark-600 shadow-inner" style={{backgroundColor: simPrimary}}></div>
                <div className="w-12 h-12 rounded-full border-2 border-dark-600 shadow-inner" style={{backgroundColor: simBg}}></div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ColorAssist;
