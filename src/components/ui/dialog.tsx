import React, { useState, useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: any;
  className?: string;
}

interface DialogContentProps {
  children?: any;
  className?: string;
}

interface DialogTriggerProps {
  children?: any;
  asChild?: boolean;
  onClick?: () => void;
}

interface DialogHeaderProps {
  children?: any;
  className?: string;
}

interface DialogTitleProps {
  children?: any;
  className?: string;
}

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
  return <>{children}</>;
};

const DialogTrigger = ({ children, onClick }: DialogTriggerProps) => {
  return <div onClick={onClick}>{children}</div>;
};

const DialogContent = ({ children, className = '' }: DialogContentProps) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative z-50 bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ children, className = '' }: DialogHeaderProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className = '' }: DialogTitleProps) => {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
}; 