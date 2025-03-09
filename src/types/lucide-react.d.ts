declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type Icon = FC<IconProps>;

  export const Shield: Icon;
  export const UserPlus: Icon;
  export const Users: Icon;
  export const Eye: Icon;
  export const ArrowDownUp: Icon;
  export const ChartBar: Icon;
  export const Calendar: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const CircleAlert: Icon;
  export const CircleCheck: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const Loader: Icon;
  export const Trash2: Icon;
  
  // Tambahkan ikon lain yang digunakan dalam aplikasi Anda di sini
} 