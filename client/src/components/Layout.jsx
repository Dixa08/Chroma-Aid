import { NavLink, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Camera, Gamepad2, Palette, User, LogOut, Eye } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Layout = () => {
  const { logout } = useAppContext();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Color Assist', path: '/color-assist', icon: <Palette size={20} /> },
    { name: 'Test', path: '/test', icon: <Eye size={20} /> },
    { name: 'Camera', path: '/camera', icon: <Camera size={20} /> },
    { name: 'Games', path: '/games', icon: <Gamepad2 size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-dark-900 text-slate-100 overflow-hidden">
      {/* Sidebar - desktop */}
      <aside className="w-64 glass-panel border-r border-dark-700 hidden md:flex flex-col h-full z-10 relative">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-500 font-sans tracking-tight flex items-center gap-2">
            <Palette className="text-primary-500" />
            Chroma Aid
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
             <NavLink
             key={item.path}
             to={item.path}
             className={({ isActive }) =>
               `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                 isActive 
                   ? 'bg-primary-600/20 text-primary-500 font-medium border border-primary-500/30' 
                   : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
               }`
             }
           >
             {item.icon}
             <span>{item.name}</span>
           </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-dark-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-dark-900 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto min-h-full">
           <Outlet />
        </div>
        
        {/* Persistent Global Camera FAB */}
        <Link 
           to="/camera" 
           className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-50 bg-primary-500 text-dark-900 p-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-primary-400 hover:scale-110 active:scale-95 transition-all duration-300"
        >
           <Camera size={28} />
        </Link>
      </main>

      {/* Bottom Nav - mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-dark-700 z-50 px-2 py-2 flex justify-around">
        {navItems.slice(0, 5).map((item) => ( // only show up to 5 on mobile
           <NavLink
           key={item.path}
           to={item.path}
           className={({ isActive }) =>
             `flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
               isActive ? 'text-primary-500' : 'text-slate-400'
             }`
           }
         >
           {item.icon}
           <span className="text-[10px] mt-1 font-medium">{item.name}</span>
         </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
