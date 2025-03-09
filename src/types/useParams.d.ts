declare module 'react-router-dom' {
  export function useParams(): Record<string, string>;
  export function useParams<T extends Record<string, string>>(): T;
} 