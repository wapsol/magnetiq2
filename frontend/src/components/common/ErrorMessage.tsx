import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message?: string;
  title?: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message = 'An error occurred', 
  title = 'Error',
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 text-red-500">
        <ExclamationTriangleIcon />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md">{message}</p>
    </div>
  );
};

export default ErrorMessage;