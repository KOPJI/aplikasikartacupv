import React from 'react';

interface LabelProps {
  children?: any;
  className?: string;
  htmlFor?: string;
}

const Label = ({
  children,
  className = '',
  htmlFor,
  ...props
}: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export { Label }; 