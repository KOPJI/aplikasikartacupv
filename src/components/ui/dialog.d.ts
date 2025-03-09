import React from 'react';

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

export const Dialog: React.FC<DialogProps>;
export const DialogTrigger: React.FC<DialogTriggerProps>;
export const DialogContent: React.FC<DialogContentProps>;
export const DialogHeader: React.FC<DialogHeaderProps>;
export const DialogTitle: React.FC<DialogTitleProps>; 