import { Link, Navigate } from 'react-router-dom';
import { Palette, ShieldCheck, Gamepad2, PlayCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Landing = () => {
  const { isAuthenticated } = useAppContext();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-dark-900 flex flex-col items-center justify-center p-6 text-center">
      
      <div className="glass-panel max-w-3xl w-full p-8 md:p-12 rounded-2xl animate-slide-up shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-primary-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          <div className="mx-auto bg-dark-800 w-20 h-20 rounded-2xl flex items-center justify-center border border-dark-700 mb-6 shadow-lg">
            <Palette className="text-primary-500 w-10 h-10" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-6 drop-shadow-sm">
            Welcome to Chroma Aid
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            A comprehensive accessibility platform for Color Vision Deficiency. Analyze visuals, find smart color pairings, and improve accessibility with interactive tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="btn-primary py-4 px-8 text-lg flex items-center justify-center gap-2">
              Get Started <PlayCircle size={20} />
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
             <div className="bg-dark-800/40 p-5 rounded-xl border border-dark-700/50">
               <ShieldCheck className="text-blue-400 mb-3" size={28} />
               <h3 className="font-semibold text-slate-200 mb-2">Smart Analysis</h3>
               <p className="text-sm text-slate-400">WCAG standard contrast checking and live accessibility scoring.</p>
             </div>
             <div className="bg-dark-800/40 p-5 rounded-xl border border-dark-700/50">
               <Palette className="text-primary-400 mb-3" size={28} />
               <h3 className="font-semibold text-slate-200 mb-2">Color Engine</h3>
               <p className="text-sm text-slate-400">Scientifically accurate complementary & analogous color generation.</p>
             </div>
             <div className="bg-dark-800/40 p-5 rounded-xl border border-dark-700/50">
               <Gamepad2 className="text-purple-400 mb-3" size={28} />
               <h3 className="font-semibold text-slate-200 mb-2">Mini Games</h3>
               <p className="text-sm text-slate-400">Engaging visual exercises to train color perception and reaction time.</p>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Landing;
