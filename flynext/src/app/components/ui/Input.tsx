import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'light' | 'dark';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, leftIcon, rightIcon, className = '', variant = 'light', ...rest }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
    
    const labelColor = variant === 'light' ? 'text-gray-700' : 'text-gray-200';
    const inputBg = variant === 'light' ? 'bg-white' : 'bg-gray-800';
    const inputText = variant === 'light' ? 'text-gray-900' : 'text-white';
    
    return (
      <div className={`${widthClass} ${className}`}>
        {label && (
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block rounded-md shadow-sm 
              ${leftIcon ? 'pl-10' : 'pl-3'} 
              ${rightIcon ? 'pr-10' : 'pr-3'} 
              py-2 
              ${errorClass} 
              focus:outline-none focus:ring-2 focus:border-transparent
              ${inputBg} ${inputText}
              ${widthClass}
            `}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
