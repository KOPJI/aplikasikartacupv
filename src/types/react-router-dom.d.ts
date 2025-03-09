declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';

  export interface LinkProps {
    to: string;
    replace?: boolean;
    state?: any;
    className?: string;
    children?: ReactNode;
  }

  export interface NavLinkProps extends LinkProps {
    end?: boolean;
    caseSensitive?: boolean;
    className?: string | ((props: { isActive: boolean }) => string);
  }

  export const Link: ComponentType<LinkProps>;
  export const NavLink: ComponentType<NavLinkProps>;
  export const useNavigate: () => (path: string) => void;
  export const useParams: () => Record<string, string>;
  export const useLocation: () => { pathname: string; search: string; hash: string; state: any };
  export const BrowserRouter: ComponentType<{ children: ReactNode }>;
  export const Routes: ComponentType<{ children: ReactNode }>;
  export const Route: ComponentType<{ path: string; element: ReactNode }>;
  export const Navigate: ComponentType<{ to: string; replace?: boolean }>;
  export const Outlet: ComponentType;
} 