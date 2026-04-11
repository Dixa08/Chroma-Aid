import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Palette, Lock, User } from 'lucide-react';

const Auth = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth API call delay
    setTimeout(() => {
      login();
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
       </div>

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-dark-800 rounded-full border border-dark-600 flex items-center justify-center mx-auto mb-4">
             <Palette className="text-primary-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-400 mt-2 text-sm">
            {isLogin ? 'Sign in to access your color profile' : 'Sign up to start improving accessibility'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="input-field pl-10" 
                  placeholder="Alex Demo"
                  defaultValue="Alex Demo"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email <span className="text-slate-500 text-xs ml-2">(Demo: any)</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User size={18} />
              </span>
              <input 
                type="email" 
                required
                className="input-field pl-10" 
                placeholder="you@example.com"
                defaultValue="demo@chromaaid.app"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password <span className="text-slate-500 text-xs ml-2">(Demo: any)</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                required
                className="input-field pl-10" 
                defaultValue="password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all 
              ${isLoading ? 'bg-primary-800 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/20'}`}
          >
            {isLoading ? (
               <span className="flex items-center justify-center gap-2">
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 Processing...
               </span>
            ) : (
               isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
