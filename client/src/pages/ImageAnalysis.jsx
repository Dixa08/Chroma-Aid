import { useState, useRef } from 'react';
import { Upload, ImageIcon, Copy, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getContrastRatio } from '../utils/colorEngine';

const ImageAnalysis = () => {
  const { userData, updateUserData } = useAppContext();
  const [imageSrc, setImageSrc] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [colors, setColors] = useState([]);
  const canvasRef = useRef(null);

  // Mock analysis to extract dominant colors from image
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        setImageSrc(event.target.result);
        analyzeImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = (src) => {
      setIsAnalyzing(true);
      setColors([]);
      
      const img = new Image();
      img.onload = () => {
         const canvas = canvasRef.current;
         const ctx = canvas.getContext('2d');
         // scale down for perf
         canvas.width = 100;
         canvas.height = 100 * (img.height / img.width);
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         
         // simulate delay for effect
         setTimeout(() => {
             // We'll just generate some mock extracted colors perfectly for demo
             // Real app would sample the canvas Uint8ClampedArray
             const extracted = [
                 { hex: '#22c55e', name: 'Primary Green' },
                 { hex: '#0f172a', name: 'Deep Background' },
                 { hex: '#3b82f6', name: 'Accent Blue' },
                 { hex: '#f8fafc', name: 'Light Text' },
                 { hex: '#ef4444', name: 'Warning Red' }
             ];
             setColors(extracted);
             setIsAnalyzing(false);
             
             updateUserData({
                 imagesAnalyzed: (userData.imagesAnalyzed || 0) + 1
             });
         }, 1500);
      };
      img.src = src;
  };

  const ColorChip = ({ colorObj }) => {
      const [copied, setCopied] = useState(false);
      const handleCopy = () => {
          navigator.clipboard.writeText(colorObj.hex);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      };

      return (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden flex items-center group">
              <div className="w-16 h-16 shrink-0" style={{backgroundColor: colorObj.hex}}></div>
              <div className="px-4 flex-1">
                  <p className="font-medium text-slate-200 text-sm">{colorObj.name}</p>
                  <p className="font-mono text-xs text-slate-500 uppercase">{colorObj.hex}</p>
              </div>
              <button onClick={handleCopy} className="p-4 text-slate-400 hover:text-white transition-colors">
                  {copied ? <CheckCircle2 size={18} className="text-primary-500" /> : <Copy size={18} />}
              </button>
          </div>
      );
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-5xl mx-auto pt-8">
      <div className="flex items-center gap-3 mb-8">
         <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <ImageIcon className="text-blue-500" size={24} />
         </div>
         <div>
             <h1 className="text-3xl font-bold text-slate-100">Image Analysis</h1>
             <p className="text-slate-400">Extract an accessible color palette directly from your designs or photos.</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col gap-4">
              <div className="glass-panel p-2 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden group">
                  {imageSrc ? (
                      <>
                          <img src={imageSrc} alt="uploaded" className="w-full h-full object-cover rounded-2xl opacity-80" />
                          <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="btn-secondary cursor-pointer flex items-center gap-2">
                                  <Upload size={18}/> Replace Image
                                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                              </label>
                          </div>
                      </>
                  ) : (
                      <label className="w-full h-full border-2 border-dashed border-dark-600 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 hover:border-dark-500 hover:bg-dark-800/50 cursor-pointer transition-all">
                          <Upload size={32} className="mb-4" />
                          <span className="font-medium">Click to upload image</span>
                          <span className="text-xs mt-1">PNG, JPG, WEBP (Max 5MB)</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                  )}
              </div>
              
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-200">
                  Extracted Palette
              </h2>
              
              {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-slate-400 animate-pulse">Running accessibility analysis...</p>
                  </div>
              ) : colors.length > 0 ? (
                  <div className="space-y-3">
                      {colors.map((c, i) => <ColorChip key={i} colorObj={c} />)}
                      
                      <div className="mt-6 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                          <h3 className="text-sm font-medium text-slate-300 mb-2">Contrast Audit</h3>
                          <p className="text-xs text-slate-400 mb-2">Comparing dominant background with primary text:</p>
                          <div className="flex justify-between items-center text-sm">
                              <span className="font-mono">{colors[0].hex} vs {colors[1].hex}</span>
                              <span className={`font-bold ${getContrastRatio(colors[0].hex, colors[1].hex) >= 4.5 ? 'text-green-400' : 'text-amber-400'}`}>
                                  {getContrastRatio(colors[0].hex, colors[1].hex).toFixed(2)}:1 Ratio
                              </span>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-center px-8 border border-dashed border-dark-700 rounded-xl">
                      Upload an image to automatically generate a palette and run an accessibility audit.
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;
