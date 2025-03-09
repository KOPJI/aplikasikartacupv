import React from 'react';

interface SelectProps {
  children?: any;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps>; 