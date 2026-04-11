import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Settings, Volume2, Save, Eye, Bell } from 'lucide-react';

const Profile = () => {
  const { userData, updateUserData } = useAppContext();
  const [formData, setFormData] = useState({
    name: userData.name,
    cvdType: userData.cvdType,
    speed: userData.voiceSettings?.speed || 1,
  });
  const [saved, setSaved] = useState(false);

  const cvdTypes = [
    "Normal Vision",
    "Protanopia",
    "Deuteranopia",
    "Tritanopia",
    "Achromatopsia",
    "Moderate Deutan"
  ];

  const handleSave = (e) => {
    e.preventDefault();
    updateUserData({
      name: formData.name,
      cvdType: formData.cvdType,
      voiceSettings: {
        ...userData.voiceSettings,
        speed: parseFloat(formData.speed)
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-4xl mx-auto pt-8 md:pt-12">
      <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3 mb-8">
        <User className="text-primary-500" size={32} />
        Profile & Settings
      </h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Details */}
        <section className="glass-panel p-6 md:p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Settings className="text-slate-400" size={20} /> Account details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Display Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Eye size={16} /> Color Vision Condition
              </label>
              <select 
                value={formData.cvdType}
                onChange={(e) => setFormData({...formData, cvdType: e.target.value})}
                className="input-field w-full appearance-none bg-dark-800"
              >
                {cvdTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Accessibility Preferences */}
        <section className="glass-panel p-6 md:p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Volume2 className="text-slate-400" size={20} /> Voice & Accessibility
          </h2>
          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Voice Reader Speed</span>
                <span className="text-primary-400">{formData.speed}x</span>
              </label>
              <input 
                type="range" 
                min="0.5" max="2" step="0.1"
                value={formData.speed}
                onChange={(e) => setFormData({...formData, speed: e.target.value})}
                className="w-full accent-primary-500 bg-dark-700 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-dark-700/50 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200 flex items-center gap-2">
                  <Bell size={16} className="text-slate-400" /> Notifications
                </p>
                <p className="text-sm text-slate-500 mt-1">Receive daily training reminders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" className="btn-primary flex items-center gap-2 py-3 px-8 text-lg font-semibold rounded-xl">
            <Save size={20} /> Save Changes
          </button>
          {saved && (
            <span className="text-primary-400 flex items-center gap-2 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary-400"></span> Saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;
