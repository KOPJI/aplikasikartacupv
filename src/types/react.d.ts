declare module 'react' {
  export type ReactNode = 
    | React.ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | React.ReactNodeArray;

  export type ReactNodeArray = Array<ReactNode>;

  export interface ReactElement<P = any, T = any> {
    type: T;
    props: P;
    key: string | null;
  }

  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null;
    displayName?: string;
  }

  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  
  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }

  export type Provider<T> = FC<{ value: T; children?: ReactNode }>;
  export type Consumer<T> = FC<{ children: (value: T) => ReactNode }>;

  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }

  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
    currentTarget: T;
  }

  export interface SVGProps<T> {
    className?: string;
    style?: React.CSSProperties;
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    [key: string]: any;
  }

  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }
} 