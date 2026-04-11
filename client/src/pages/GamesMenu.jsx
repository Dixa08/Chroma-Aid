import { Link } from 'react-router-dom';
import { Gamepad2, Brain, Target, Play } from 'lucide-react';

const GamesMenu = () => {
  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-5xl mx-auto pt-8 md:pt-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-dark-800 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg border border-dark-700">
           <Gamepad2 className="text-purple-500" size={40} />
        </div>
        <h1 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">Perception Training Menu</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Improve your color differentiation and reaction times through interactive, scientifically designed mini-games.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Game 1 Card */}
        <div className="glass-panel p-8 rounded-3xl group hover:border-primary-500/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all"></div>
          
          <Target className="text-primary-500 mb-6" size={48} />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Color Match</h2>
          <p className="text-slate-400 mb-8 min-h-[4rem]">Spot the closest match to a target color. Trains hue sensitivity and visual memory over time.</p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="bg-dark-800 px-4 py-2 rounded-lg text-sm text-slate-300 border border-dark-700">
              <span className="text-primary-400 mr-2">♦</span> Accuracy Game
            </div>
            <Link to="/games/match" className="btn-primary rounded-full px-6 flex items-center gap-2">
              Play <Play size={16} />
            </Link>
          </div>
        </div>

        {/* Game 2 Card */}
        <div className="glass-panel p-8 rounded-3xl group hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          
          <Brain className="text-blue-500 mb-6" size={48} />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Odd One Out</h2>
          <p className="text-slate-400 mb-8 min-h-[4rem]">Find the single tile that differs in shade. Enhances rapid shade discrimination and reflexes.</p>
          
          <div className="flex items-center justify-between mt-auto">
             <div className="bg-dark-800 px-4 py-2 rounded-lg text-sm text-slate-300 border border-dark-700">
              <span className="text-blue-400 mr-2">⚡</span> Reaction Game
            </div>
            <Link to="/games/odd" className="btn-primary !bg-blue-600 hover:!bg-blue-500 !shadow-[0_0_15px_rgba(37,99,235,0.3)] rounded-full px-6 flex items-center gap-2">
              Play <Play size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GamesMenu;
