declare module 'react-router-dom' {
  export function useParams<T extends Record<string, string>>(): T;
} 