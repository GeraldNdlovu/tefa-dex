import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ErrorMessageProps {
  message: string;
  type: 'warning' | 'error' | 'info' | 'success';
  onClose?: () => void;
  duration?: number;
}

export function ErrorMessage({ message, type, onClose, duration = 5000 }: ErrorMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const styles = {
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    success: 'bg-green-500/20 border-green-500/30 text-green-400'
  };

  const icons = {
    warning: <AlertTriangle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />
  };

  return (
    <div className={`fixed top-20 right-4 z-50 p-4 rounded-xl border backdrop-blur-sm ${styles[type]} animate-in slide-in-from-right`}>
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-sm">{message}</span>
        <button onClick={() => setVisible(false)} className="ml-4 opacity-70 hover:opacity-100">
          <X className="w-4 h-5" />
        </button>
      </div>
    </div>
  );
}
