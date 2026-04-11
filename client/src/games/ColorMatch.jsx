import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Helper to jitter a color hex based on difficulty
const generateVariance = (baseHue, baseSat, baseLight, difficulty) => {
  // Lower difficulty = higher variance = easier to spot
  const range = Math.max(5, 30 - (difficulty * 5)); 
  const dh = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * range);
  
  // Quick HSL to Hex (simplified for the game)
  const l = baseLight / 100;
  const a = baseSat * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + (baseHue + dh) / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const ColorMatch = () => {
  const navigate = useNavigate();
  const { userData, updateUserData } = useAppContext();
  
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState('');
  const [options, setOptions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const generateRound = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.floor(Math.random() * 40); // 60-100%
    const l = 40 + Math.floor(Math.random() * 20); // 40-60%
    
    // Create base hex
    const aVal = s * Math.min(l/100, 1 - l/100) / 100;
    const fBase = n => {
      const k = (n + h / 30) % 12;
      const color = (l/100) - aVal * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    const baseColor = `#${fBase(0)}${fBase(8)}${fBase(4)}`;
    
    setTargetColor(baseColor);
    
    // Generate 3 wrong options & 1 right
    let newOpts = [baseColor];
    for(let i=0; i<3; i++) {
       newOpts.push(generateVariance(h, s, l, level));
    }
    setOptions(newOpts.sort(() => Math.random() - 0.5));
    setFeedback(null);
  };

  useEffect(() => {
    generateRound();
  }, [level]);

  const handlePick = (color) => {
    if (color === targetColor) {
      setScore(s => s + (level * 10));
      setFeedback('correct');
      setTimeout(() => {
        if(level >= 10) {
          endGame();
        } else {
          setLevel(l => l + 1);
        }
      }, 600);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        endGame();
      }, 1000);
    }
  };

  const endGame = () => {
    setGameOver(true);
    const currentBest = userData.gameStats.bestScore;
    updateUserData({
      gameStats: {
        ...userData.gameStats,
        bestScore: Math.max(currentBest, score)
      }
    });
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in px-4">
         <div className="glass-panel p-10 rounded-3xl text-center max-w-md w-full">
            <Award className="text-amber-500 w-20 h-20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Game Over!</h2>
            <p className="text-slate-400 mb-6">You reached Level {level}</p>
            
            <div className="bg-dark-800 rounded-xl p-6 mb-8 border border-dark-700">
               <span className="text-sm text-slate-500 uppercase font-bold tracking-wider">Final Score</span>
               <div className="text-5xl font-black text-primary-500 mt-2">{score}</div>
            </div>
            
            <div className="flex gap-4 justify-center">
               <button onClick={() => { setLevel(1); setScore(0); setGameOver(false); }} className="btn-primary flex-1">Play Again</button>
               <button onClick={() => navigate('/games')} className="btn-secondary flex-1">Menu</button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto pt-8">
      <button onClick={() => navigate('/games')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Games
      </button>

      <div className="flex justify-between items-center mb-8">
         <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4">
            <div><span className="text-slate-500 text-sm">Level</span><br/><span className="text-xl font-bold text-slate-200">{level}/10</span></div>
            <div className="w-px h-8 bg-dark-700"></div>
            <div><span className="text-slate-500 text-sm">Score</span><br/><span className="text-xl font-bold text-primary-400">{score}</span></div>
         </div>
      </div>

      <div className="glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center border-t-4 border-t-primary-500">
         <h2 className="text-xl text-slate-300 font-medium mb-8">Match this exact color:</h2>
         
         {/* Target Color */}
         <div 
           className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-2xl mb-12 border-4 border-dark-800 transform transition-transform" 
           style={{ backgroundColor: targetColor }}
         ></div>

         {/* Options Grid */}
         <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {options.map((opt, idx) => (
             <button
               key={idx}
               disabled={feedback !== null}
               onClick={() => handlePick(opt)}
               className={`h-24 md:h-32 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
                  feedback === 'correct' && opt === targetColor ? 'border-green-500 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 
                  feedback === 'wrong' && opt !== targetColor ? 'border-red-500 opacity-50 blur-[2px]' : 'border-transparent hover:border-white/20'
               }`}
               style={{ backgroundColor: opt }}
             />
           ))}
         </div>
      </div>
    </div>
  );
};

export default ColorMatch;
