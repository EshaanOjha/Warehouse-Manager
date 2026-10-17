import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AlertBell() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/customer/alerts');
      setAlerts(res.data.alerts || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/customer/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a.alert_id === id ? { ...a, is_read: 1 } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/customer/alerts/mark-all-read');
      setAlerts(prev => prev.map(a => ({ ...a, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all alerts read:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-sm border border-slate-700 bg-slate-950 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
        title="Notifications"
      >
        <span className="material-symbols-outlined text-[17px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-slate-900 border border-slate-700 rounded-sm shadow-xl p-3 z-50 max-h-96 overflow-y-auto font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-[12px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Alerts ({unreadCount} unread)
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer border-none bg-transparent"
              >
                Mark all read
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <p className="text-slate-400 text-[11px] text-center py-4">No active notifications</p>
          ) : (
            <div className="flex flex-col gap-2">
              {alerts.map(a => (
                <div
                  key={a.alert_id}
                  className={`p-2 rounded-sm border ${
                    !a.is_read
                      ? 'bg-slate-950 border-amber-500/40'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold uppercase">
                      {a.alert_type}
                    </span>
                    {!a.is_read && (
                      <button
                        onClick={(e) => markAsRead(a.alert_id, e)}
                        className="text-[10px] text-slate-400 hover:text-white border-none bg-transparent cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">{a.message}</p>
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
