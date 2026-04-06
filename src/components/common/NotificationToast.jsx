import React, { useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';

const NotificationToast = ({ notifications, onDismiss }) => {
    if (!notifications || notifications.length === 0) return null;

    return (
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 w-80">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className="bg-white border-l-4 border-indigo-600 shadow-xl rounded-r-lg p-4 animate-in slide-in-from-right duration-300 flex items-start gap-3 relative"
                >
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full shrink-0">
                        <Bell size={18} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm">New Notification</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-snug">{notif.message}</p>
                    </div>
                    <button
                        onClick={() => onDismiss(notif.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
