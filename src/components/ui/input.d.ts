import React from 'react';

interface InputProps {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: any;
  disabled?: boolean;
}

export const Input: React.FC<InputProps>; 