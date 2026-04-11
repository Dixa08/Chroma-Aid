import { useEffect, useRef, useState } from 'react';
import { Eye, ArrowRight, RefreshCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Test = () => {
  const canvasRef = useRef(null);
  const { userData, updateUserData } = useAppContext();
  const [currentTest, setCurrentTest] = useState(1);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState(false);
  const totalTests = 6;

  // Answers for procedurally generated mock numbers
  const testAnswers = [
     { number: "12", type: "Demo Plate" },
     { number: "8", type: "Red-Green" },
     { number: "6", type: "Blue-Yellow" },
     { number: "5", type: "Red-Green (Deutan)" },
     { number: "3", type: "Red-Green (Protan)" },
     { number: "74", type: "Total Color Blindness" }
  ];

  const drawIshiharaMockup = (ctx, numberToDraw, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    // Create an offscreen canvas to act as a text mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.fillStyle = 'black';
    maskCtx.font = 'bold 120px sans-serif';
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.fillText(numberToDraw, width / 2, height / 2);
    
    const maskData = maskCtx.getImageData(0, 0, width, height).data;

    // Background dots (mostly green/brown)
    const baseColors = ['#8da372', '#a0b182', '#76855b', '#c2b376', '#dec881'];
    // Number dots (mostly red/orange)
    const numberColors = ['#e1846b', '#d16a54', '#cb5643', '#df9482'];

    const dotRadiusMax = 12;
    const dotRadiusMin = 4;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 10;

    for (let i = 0; i < 2500; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const dotR = dotRadiusMin + Math.random() * (dotRadiusMax - dotRadiusMin);
        
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, 2 * Math.PI, false);
        
        // Check mask
        const px = Math.floor(x);
        const py = Math.floor(y);
        let isNumber = false;
        if (px >= 0 && px < width && py >= 0 && py < height) {
            const alpha = maskData[(py * width + px) * 4 + 3];
            if (alpha > 128) isNumber = true;
        }

        ctx.fillStyle = isNumber 
            ? numberColors[Math.floor(Math.random() * numberColors.length)] 
            : baseColors[Math.floor(Math.random() * baseColors.length)];
            
        ctx.fill();
    }
  };

  useEffect(() => {
     if(!results && canvasRef.current) {
         const canvas = canvasRef.current;
         const ctx = canvas.getContext('2d');
         // Use the current test index to draw the corresponding number
         drawIshiharaMockup(ctx, testAnswers[currentTest-1].number, canvas.width, canvas.height);
     }
  }, [currentTest, results]);

  const handleSubmit = (e) => {
      e.preventDefault();
      if(currentTest < totalTests) {
          setCurrentTest(c => c + 1);
          setAnswer('');
      } else {
          setResults(true);
          updateUserData({
              testsTaken: (userData.testsTaken || 0) + 1,
              score: Math.min(100, (userData.score || 0) + 5)
          });
      }
  };

  if (results) {
      return (
         <div className="p-4 md:p-8 animate-fade-in max-w-2xl mx-auto pt-16 text-center">
            <div className="glass-panel p-10 rounded-3xl">
                <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Eye className="text-primary-500 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 mb-4">Test Completed!</h2>
                <p className="text-slate-400 mb-8">Based on this quick analysis, your color perception is aligning with: <strong className="text-primary-400 block mt-2 text-xl">{userData.cvdType}</strong></p>
                <div className="flex gap-4 justify-center">
                   <button onClick={() => { setCurrentTest(1); setResults(false); setAnswer(''); }} className="btn-secondary flex items-center gap-2 px-6">
                      <RefreshCcw size={18} /> Retake
                   </button>
                </div>
            </div>
         </div>
      );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-3xl mx-auto pt-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Ishihara Vision Test</h1>
        <p className="text-slate-400">Plate {currentTest} of {totalTests} - {testAnswers[currentTest-1].type}</p>
        <div className="w-full bg-dark-800 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-primary-500 h-full transition-all duration-300" style={{width: `${(currentTest/totalTests)*100}%`}}></div>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-10 rounded-3xl flex flex-col items-center">
         <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full flex items-center justify-center overflow-hidden mb-8 shadow-2xl p-2 border-8 border-dark-800">
             {/* The canvas rendering the generated Ishihara Plate */}
             <canvas ref={canvasRef} width={300} height={300} className="rounded-full w-full h-full object-cover"></canvas>
         </div>

         <form onSubmit={handleSubmit} className="w-full max-w-sm">
             <label className="block text-center text-slate-300 font-medium mb-4">What number do you see?</label>
             <div className="flex gap-3">
                <input 
                   type="text" 
                   value={answer}
                   onChange={e => setAnswer(e.target.value)}
                   className="input-field text-center text-xl tracking-widest font-mono"
                   placeholder="Enter number"
                   autoFocus
                />
                <button type="submit" className="btn-primary hover:!bg-primary-500 !shadow-none !px-6 flex items-center justify-center">
                    <ArrowRight size={20} />
                </button>
             </div>
             <div className="mt-4 text-center">
                 <button type="button" onClick={handleSubmit} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                     I don't see any number
                 </button>
             </div>
         </form>
      </div>
    </div>
  );
};

export default Test;
