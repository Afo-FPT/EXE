'use client';

import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'solar:check-circle-bold';
      case 'error':
        return 'solar:close-circle-bold';
      case 'info':
        return 'solar:info-circle-bold';
      default:
        return 'solar:info-circle-bold';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className={`${getBgColor()} text-white px-6 py-4 rounded-lg shadow-lg max-w-sm flex items-center space-x-3`}>
        <Icon icon={getIcon()} className="text-xl flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <Icon icon="solar:close-bold" className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
