import { useAppContext } from '../context/AppContext';
import { Activity, Trophy, Gamepad2, Eye, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="glass-panel p-6 rounded-2xl flex items-start justify-between group hover:border-dark-600 transition-colors">
    <div>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
    <div className={`p-3 rounded-xl bg-dark-800 border border-dark-700 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} />
    </div>
  </div>
);

const ProgressBar = ({ label, value, max, color }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-300">{label}</span>
      <span className="text-slate-400 font-mono">{value}/{max}</span>
    </div>
    <div className="w-full bg-dark-800 rounded-full h-2.5 border border-dark-700 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full ${color} transition-all duration-1000 ease-out`} 
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

const Dashboard = () => {
  const { userData } = useAppContext();

  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-6xl mx-auto pt-8 md:pt-12">
      <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {userData.name}. Your CVD profile: <span className="text-primary-400 font-medium">{userData.cvdType}</span></p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3 border-primary-500/30">
          <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse"></div>
          <span className="text-sm font-medium text-primary-100">Live Tracking Active</span>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard 
          title="Overall Score" 
          value={userData.score} 
          subtitle="Top 15% of users"
          icon={Activity} 
          colorClass="text-primary-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
        />
        <StatCard 
          title="Tests Taken" 
          value={userData.testsTaken} 
          subtitle="Consistency is key"
          icon={Eye} 
          colorClass="text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
        />
        <StatCard 
          title="Images Analyzed" 
          value={userData.imagesAnalyzed} 
          subtitle="Learning everyday"
          icon={TrendingUp} 
          colorClass="text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
        />
        <StatCard 
          title="Game High Score" 
          value={userData.gameStats.bestScore} 
          subtitle={`Accuracy: ${userData.gameStats.accuracy}%`}
          icon={Trophy} 
          colorClass="text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Charts */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-primary-500" size={20} />
              <h2 className="text-xl font-bold text-slate-100">Performance Metrics</h2>
            </div>
            
            <div className="space-y-6">
              <ProgressBar label="Color Discrimination" value={82} max={100} color="bg-primary-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <ProgressBar label="Reaction Time (ms)" value={450} max={1000} color="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <ProgressBar label="Accuracy Trend" value={userData.gameStats.accuracy} max={100} color="bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 rounded-2xl bg-dark-800/80">
          <div className="flex items-center gap-2 mb-6">
             <Gamepad2 className="text-secondary-400" size={20} />
             <h2 className="text-xl font-bold text-slate-100">Recent Activity</h2>
          </div>
          <div className="space-y-4">
             {[
               { title: "Played 'Odds One Out'", result: "Scored 120", time: "2 hours ago", color: "bg-purple-500/20 text-purple-400" },
               { title: "Analyzed Workspace Photo", result: "3 Accessability flags", time: "Yesterday", color: "bg-blue-500/20 text-blue-400" },
               { title: "Completed Ishihara Test", result: "Score improved by 5%", time: "3 days ago", color: "bg-primary-500/20 text-primary-400" },
               { title: "Tried 'Color Match'", result: "78% Accuracy", time: "Last week", color: "bg-amber-500/20 text-amber-400" },
             ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-700/50 transition-colors border border-transparent hover:border-dark-600/50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                     <Gamepad2 size={18} />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-medium text-slate-200">{item.title}</p>
                     <p className="text-xs text-slate-400">{item.result}</p>
                  </div>
                  <div className="text-xs text-slate-500">{item.time}</div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
