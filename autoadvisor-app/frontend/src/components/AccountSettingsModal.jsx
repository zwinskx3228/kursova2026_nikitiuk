import React, { useState } from 'react';

export default function AccountSettingsModal({ user, onClose }) {
  const [emailAlerts, setEmailAlerts] = useState(user.email_alerts || false);
  const [frequency, setFrequency] = useState('Daily digest');
  const [minLiquidity, setMinLiquidity] = useState(85);

  const handleSave = () => {
    // API запит на збереження налаштувань користувача в БД
    console.log({ emailAlerts, frequency, minLiquidity });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Account settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <p className="text-sm text-slate-500 mb-6">Control your profile and opportunity alerts.</p>

        {/* Поле email розсилки з галочкою */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">New vehicle email alerts</h4>
              <p className="text-xs text-slate-500">Receive a message when newly listed cars match your current search profile.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailAlerts} 
                onChange={(e) => setEmailAlerts(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {emailAlerts && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Delivery frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border rounded-lg text-sm">
                  <option>Instant</option>
                  <option>Daily digest</option>
                  <option>Weekly summary</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Minimum liquidity score: {minLiquidity}+</label>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  value={minLiquidity} 
                  onChange={(e) => setMinLiquidity(Number(e.target.value))}
                  className="w-full mt-3 accent-emerald-500" 
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl text-sm">Save preferences</button>
        </div>
      </div>
    </div>
  );
}