import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Helper for HSL Hex variance 
// OddOneOut uses a very slight variance that gets harder each round
const generateOddColor = (baseColorHex, round) => {
  // convert base to rgb first simply
  const r = parseInt(baseColorHex.slice(1,3), 16);
  const g = parseInt(baseColorHex.slice(3,5), 16);
  const b = parseInt(baseColorHex.slice(5,7), 16);
  
  // High round = small factor
  const factor = Math.max(0.01, 0.15 - (round * 0.01)); 
  const sign = Math.random() > 0.5 ? 1 : -1;
  const modR = Math.min(255, Math.max(0, r + (r * factor * sign)));
  const modG = Math.min(255, Math.max(0, g + (g * factor * sign)));
  const modB = Math.min(255, Math.max(0, b + (b * factor * sign)));
  
  return `#${Math.round(modR).toString(16).padStart(2,'0')}${Math.round(modG).toString(16).padStart(2,'0')}${Math.round(modB).toString(16).padStart(2,'0')}`;
};

const getRandomHex = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

const OddOneOut = () => {
  const navigate = useNavigate();
  const { userData, updateUserData } = useAppContext();
  
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gridSize, setGridSize] = useState(4); // 2x2 up to 4x4
  const [baseColor, setBaseColor] = useState('');
  const [oddColor, setOddColor] = useState('');
  const [oddIndex, setOddIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);

  const startRound = () => {
     const newGridSize = round < 3 ? 4 : (round < 7 ? 9 : 16); // 2x2, 3x3, 4x4
     setGridSize(newGridSize);
     
     const base = getRandomHex();
     setBaseColor(base);
     setOddColor(generateOddColor(base, round));
     setOddIndex(Math.floor(Math.random() * newGridSize));
     
     if(timerRef.current) clearInterval(timerRef.current);
     timerRef.current = setInterval(() => {
        setTimeLeft(t => {
           if (t <= 1) {
              clearInterval(timerRef.current);
              handleGameOver();
              return 0;
           }
           return t - 1;
        });
     }, 1000);
  };

  useEffect(() => {
    startRound();
    return () => clearInterval(timerRef.current);
  }, [round]);

  const handleGameOver = () => {
     setGameOver(true);
     clearInterval(timerRef.current);
     updateUserData({
         gameStats: {
             ...userData.gameStats,
             bestScore: Math.max(userData.gameStats.bestScore, score)
         }
     });
  };

  const handleTap = (index) => {
     if (index === oddIndex) {
         setScore(s => s + (round * 5) + timeLeft);
         setTimeLeft(t => Math.min(20, t + 3)); // Bonus time
         setRound(r => r + 1);
     } else {
         setTimeLeft(t => Math.max(0, t - 3)); // Penalty
         // brief flash red effect handled via CSS animation if possible
     }
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in px-4">
         <div className="glass-panel p-10 rounded-3xl text-center max-w-md w-full border-t-4 border-blue-500">
            <Zap className="text-blue-500 w-20 h-20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Time's Up!</h2>
            <p className="text-slate-400 mb-6">You survived {round - 1} rounds</p>
            
            <div className="bg-dark-800 rounded-xl p-6 mb-8 border border-dark-700">
               <span className="text-sm text-slate-500 uppercase font-bold tracking-wider">Total Score</span>
               <div className="text-5xl font-black text-blue-500 mt-2">{score}</div>
            </div>
            
            <div className="flex gap-4 justify-center">
               <button onClick={() => { setRound(1); setScore(0); setTimeLeft(15); setGameOver(false); }} className="btn-primary !bg-blue-600 hover:!bg-blue-500 flex-1">Restart</button>
               <button onClick={() => navigate('/games')} className="btn-secondary flex-1">Menu</button>
            </div>
         </div>
      </div>
    );
  }

  // Calculate grid template based on size
  const gridClasses = {
      4: 'grid-cols-2 grid-rows-2',
      9: 'grid-cols-3 grid-rows-3',
      16: 'grid-cols-4 grid-rows-4'
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-2xl mx-auto pt-8">
      <button onClick={() => navigate('/games')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Games
      </button>

      <div className="flex justify-between items-center mb-8">
         <div className="glass-panel px-6 py-3 rounded-xl flex items-center justify-between w-full gap-4">
            <div className="flex flex-col items-start"><span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Round</span><span className="text-xl font-bold text-slate-200">{round}</span></div>
            <div className="flex flex-col items-center text-center">
               <span className="text-slate-500 text-xs uppercase font-bold tracking-wider flex items-center gap-1"><Clock size={12}/> Time</span>
               <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>{timeLeft}s</span>
            </div>
            <div className="flex flex-col items-end"><span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Score</span><span className="text-xl font-bold text-slate-200">{score}</span></div>
         </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center">
         <div className={`grid gap-3 w-full max-w-md aspect-square ${gridClasses[gridSize]}`}>
            {Array.from({length: gridSize}).map((_, idx) => (
               <button
                  key={idx}
                  onClick={() => handleTap(idx)}
                  className="rounded-xl w-full h-full shadow-md transition-transform active:scale-95 hover:brightness-110 border border-black/10"
                  style={{ backgroundColor: idx === oddIndex ? oddColor : baseColor }}
               />
            ))}
         </div>
         <p className="mt-8 text-slate-400 font-medium tracking-wide">Tap the tile with a different shade</p>
      </div>
    </div>
  );
};

export default OddOneOut;
