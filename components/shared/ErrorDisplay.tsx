import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ErrorHandlingResult, ErrorRecoveryAction } from '../../services/errorHandlingService';
import Button from './Button';

interface ErrorDisplayProps {
  error: ErrorHandlingResult | null;
  onDismiss: () => void;
  onRecoveryAction: (action: ErrorRecoveryAction) => void;
  show: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onDismiss, 
  onRecoveryAction, 
  show 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissTimer, setDismissTimer] = useState<NodeJS.Timeout | null>(null);

  if (!show || !error) return null;

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-6 w-6 text-amber-400" />;
      case 'medium':
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
      case 'low':
        return <CheckCircleIcon className="h-6 w-6 text-emerald-400" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-slate-400" />;
    }
  };

  const getSeverityColors = () => {
    switch (error.severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          accent: 'text-red-400'
        };
      case 'high':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          accent: 'text-amber-400'
        };
      case 'medium':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          accent: 'text-blue-400'
        };
      case 'low':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          accent: 'text-emerald-400'
        };
      default:
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          accent: 'text-slate-400'
        };
    }
  };

  const colors = getSeverityColors();

  const handleRecoveryAction = async (action: ErrorRecoveryAction) => {
    if (action.action === 'retry') {
      setIsRetrying(true);
    }

    try {
      await onRecoveryAction(action);
    } finally {
      setIsRetrying(false);
    }
  };

  // Auto-dismiss low severity errors after 5 seconds
  React.useEffect(() => {
    if (error.severity === 'low' && !dismissTimer) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      setDismissTimer(timer);
    }

    return () => {
      if (dismissTimer) {
        clearTimeout(dismissTimer);
        setDismissTimer(null);
      }
    };
  }, [error.severity, dismissTimer, onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div className={`
        ${colors.bg} ${colors.border} backdrop-blur-lg border rounded-2xl p-6 shadow-2xl
        animate-in slide-in-from-top-2 duration-300
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getSeverityIcon()}
            <div>
              <h3 className="text-white font-semibold">
                {error.severity === 'critical' && 'Critical Error'}
                {error.severity === 'high' && 'Error'}
                {error.severity === 'medium' && 'Warning'}
                {error.severity === 'low' && 'Notice'}
              </h3>
              {error.severity === 'low' && (
                <p className="text-xs text-slate-400">Auto-dismissing in 5s</p>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Error Message */}
        <div className="mb-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            {error.userMessage}
          </p>
        </div>

        {/* Recovery Actions */}
        {error.recoveryActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium text-sm">What would you like to do?</h4>
            <div className="space-y-2">
              {error.recoveryActions.map((action, index) => (
                <div key={index} className="space-y-1">
                  <Button
                    variant={action.action === 'retry' ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => handleRecoveryAction(action)}
                    disabled={isRetrying && action.action === 'retry'}
                    className="w-full justify-start"
                  >
                    {isRetrying && action.action === 'retry' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Retrying...
                      </div>
                    ) : (
                      action.label
                    )}
                  </Button>
                  <p className="text-xs text-slate-400 px-3">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar for auto-dismiss */}
        {error.severity === 'low' && (
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-75"
                style={{
                  animation: 'shrink 5s linear forwards'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        
        .duration-300 {
          animation-duration: 300ms;
        }
      `}</style>
    </div>
  );
};

export default ErrorDisplay;