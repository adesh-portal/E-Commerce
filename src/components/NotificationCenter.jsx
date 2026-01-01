import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const Toast = ({
  id,
  title,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  action,
}) => {
  const [progress, setProgress] = useState(100);
  const [hovered, setHovered] = useState(false);
  const startRef = useRef(Date.now());
  const remainingRef = useRef(duration);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(remainingRef.current - elapsed, 0);
    const pct = (remaining / duration) * 100;
    setProgress(pct);
    if (remaining <= 0) {
      onDismiss(id);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [duration, id, onDismiss]);

  useEffect(() => {
    if (duration <= 0) return undefined;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, duration]);

  const pause = () => {
    setHovered(true);
    const elapsed = Date.now() - startRef.current;
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
    cancelAnimationFrame(rafRef.current);
  };

  const resume = () => {
    setHovered(false);
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const Icon = ICONS[type] || Info;
  const color =
    type === 'success' ? 'bg-green-500 border-green-600'
    : type === 'error' ? 'bg-red-500 border-red-600'
    : type === 'warning' ? 'bg-yellow-500 border-yellow-600'
    : 'bg-blue-500 border-blue-600';

  return (
    <div
      className={`w-[360px] max-w-[90vw] text-white rounded-xl shadow-lg border ${color} overflow-hidden`}
      onMouseEnter={pause}
      onMouseLeave={resume}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={20} />
        <div className="flex-1">
          {title && <div className="text-sm font-semibold mb-0.5">{title}</div>}
          <div className="text-sm">{message}</div>
          {action && (
            <button
              onClick={() => { action.onClick?.(); onDismiss(id); }}
              className="mt-2 text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
      {duration > 0 && (
        <div className="h-1 w-full bg-black/10">
          <div
            className={`h-full ${hovered ? 'bg-white/50' : 'bg-white/80'}`}
            style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
          />
        </div>
      )}
    </div>
  );
};

const positionToClasses = (position) => {
  switch (position) {
    case 'top-left': return 'top-4 left-4';
    case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
    case 'bottom-right': return 'bottom-4 right-4';
    case 'bottom-left': return 'bottom-4 left-4';
    case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
    default: return 'top-4 right-4';
  }
};

const NotificationCenter = ({ notifications = [], onDismiss, position = 'top-right' }) => {
  if (!notifications.length) return null;
  return (
    <div className={`fixed z-50 ${positionToClasses(position)} flex flex-col gap-3`}>
      {notifications.map((n) => (
        <Toast key={n.id} {...n} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default NotificationCenter;


