import { useEffect, useState } from 'react';
import { Camera as CameraIcon, StopCircle, RefreshCcw, ScanLine } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useVoice } from '../hooks/useVoice';
import { getAccessibleTextColor } from '../utils/colorEngine';

const Camera = () => {
  const { startCamera, stopCamera, isScanning, videoRef, error } = useCamera();
  const { speak } = useVoice();
  const [detectedColor, setDetectedColor] = useState('#0f172a'); // default dark
  const [colorName, setColorName] = useState('Waiting...');
  const [continuousScan, setContinuousScan] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const lastSpokenRef = useRef(0);

  const processColorParams = (r, g, b, shouldSpeak = false) => {
      setHasDetected(true);
      const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      setDetectedColor(hex);
      
      let name = "Unknown";
      const sum = r + g + b;
      if (sum < 100) name = "Very Dark / Black";
      else if (sum > 650) name = "Very Light / White";
      else if (r > g + 50 && r > b + 50) name = "Vibrant Red";
      else if (g > r + 50 && g > b + 50) name = "Bright Green";
      else if (b > r + 50 && b > g + 50) name = "Deep Blue";
      else if (r > 150 && g > 150 && b < 100) name = "Yellow / Olive";
      else if (r > 150 && g > 100 && b < 100) name = "Orange / Brown";
      else if (r > 150 && b > 150 && g < 100) name = "Purple / Magenta";
      else if (g > 150 && b > 150 && r < 100) name = "Cyan / Teal";
      else name = "Gray / Mixed Hue";
      
      setColorName(name);

      if (shouldSpeak) {
          const now = Date.now();
          // Throttle voice strictly to once every 2 seconds
          if (now - lastSpokenRef.current > 2000) {
              speak(name);
              lastSpokenRef.current = now;
          }
      }
  };

  const handleVideoClick = (e) => {
      const video = videoRef.current;
      if (!video) return;
      
      const rect = video.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const scaleX = video.videoWidth / rect.width;
      const scaleY = video.videoHeight / rect.height;
      const sx = x * scaleX;
      const sy = y * scaleY;
      
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, sx, sy, 1, 1, 0, 0, 1, 1);
      
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      processColorParams(pixel[0], pixel[1], pixel[2], true);
      
      // We no longer turn off continuous scan here. Let them overlap.
      // If the user tapped manually, they just overrode the last read.
  };

  // Live color detection logic from center of video stream
  useEffect(() => {
     let interval;
     if (isScanning && continuousScan && videoRef.current) {
         const canvas = document.createElement('canvas');
         canvas.width = 1;
         canvas.height = 1;
         const ctx = canvas.getContext('2d', { willReadFrequently: true });

         interval = setInterval(() => {
             const video = videoRef.current;
             if (video && video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                 ctx.drawImage(video, video.videoWidth / 2, video.videoHeight / 2, 1, 1, 0, 0, 1, 1);
                 const pixel = ctx.getImageData(0, 0, 1, 1).data;
                 processColorParams(pixel[0], pixel[1], pixel[2], true);
             }
         }, 200); // scan rapidly every 200ms
     }
     return () => clearInterval(interval);
  }, [isScanning, continuousScan, speak, videoRef]);

  useEffect(() => {
      // cleanup on unmount
      return () => stopCamera();
  },[]);

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto pt-8 flex flex-col min-h-[85vh]">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
             <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <CameraIcon className="text-red-500" size={24} />
             </div>
             <div>
                 <h1 className="text-3xl font-bold text-slate-100">Live Camera</h1>
                 <p className="text-slate-400">Point at an object or click the screen to test colors.</p>
             </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6">
          {/* Camera Viewport */}
          <div className="flex-1 glass-panel p-2 rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[300px]">
              {error ? (
                  <div className="text-center p-6 text-red-400">
                      <p>Camera Error: {error}</p>
                      <p className="text-sm mt-2 text-slate-500">Ensure permissions are granted.</p>
                  </div>
              ) : isScanning ? (
                  <>
                      {/* Video element acting as finder */}
                      <video 
                         ref={videoRef} 
                         autoPlay 
                         playsInline 
                         muted 
                         onClick={handleVideoClick}
                         className="w-full h-full object-cover rounded-2xl cursor-crosshair"
                      />
                      
                      {/* Crosshair Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-16 h-16 border-2 border-white/50 rounded-full flex items-center justify-center">
                             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                         </div>
                      </div>
                      
                      {continuousScan && (
                         <div className="absolute top-6 right-6 px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-2">
                            <ScanLine size={12}/> Live Scan
                         </div>
                      )}
                  </>
              ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 h-full p-8 text-center">
                      <CameraIcon size={48} className="mb-4 opacity-50" />
                      <p>Camera is currently off</p>
                      <button onClick={startCamera} className="mt-6 btn-primary">Start Camera</button>
                  </div>
              )}
          </div>

          {/* Analysis Sidebar */}
          <div className="w-full md:w-80 flex flex-col gap-4">
              <div 
                 className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center transition-colors duration-500 min-h-[200px]"
                 style={{ 
                     backgroundColor: isScanning && hasDetected ? detectedColor : 'transparent',
                     color: isScanning && hasDetected ? getAccessibleTextColor(detectedColor) : 'inherit'
                 }}
              >
                  {isScanning && hasDetected ? (
                      <>
                         <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Detected</p>
                         <h2 className="text-3xl font-black">{colorName}</h2>
                         <p className="font-mono mt-4 text-sm opacity-90 p-2 rounded-lg bg-black/20 backdrop-blur-sm">{detectedColor}</p>
                      </>
                  ) : (
                      <p className="text-slate-400">Waiting for detection...</p>
                  )}
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h3 className="font-semibold text-slate-200">Controls</h3>
                  
                  <button 
                     disabled={!isScanning}
                     onClick={() => setContinuousScan(!continuousScan)}
                     className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                         continuousScan ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-slate-200 hover:bg-dark-600'
                     }`}
                  >
                     <RefreshCcw size={18} className={continuousScan ? 'animate-spin' : ''} />
                     {continuousScan ? 'Stop Scanning' : 'Continuous Scan'}
                  </button>

                  {isScanning && (
                      <button onClick={stopCamera} className="w-full py-3 bg-dark-800 text-slate-400 border border-dark-700 rounded-xl flex items-center justify-center gap-2 hover:bg-dark-700 transition-colors">
                          <StopCircle size={18}/> Turn Off Camera
                      </button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Camera;
