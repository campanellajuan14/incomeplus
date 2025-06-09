import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-error-50',
    borderColor: 'border-error-200',
    textColor: 'text-error-700',
    iconColor: 'text-error-400',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconColor: 'text-green-400',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-400',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-400',
  },
};

const Alert: React.FC<AlertProps> = ({ variant, children, className = '' }) => {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} border ${config.borderColor} ${config.textColor} px-4 py-3 rounded-lg flex items-start ${className}`}
      role="alert"
    >
      <Icon className={`h-5 w-5 ${config.iconColor} mr-2 mt-0.5 flex-shrink-0`} />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Alert; 