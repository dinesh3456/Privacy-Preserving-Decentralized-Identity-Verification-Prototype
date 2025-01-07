// src/types/window.d.ts
export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      selectedAddress?: string;
      isConnected?: () => boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (
        eventName: string,
        handler: (...args: any[]) => void
      ) => void;
      removeAllListeners: (eventName: string) => void;
      autoRefreshOnNetworkChange?: boolean;
    };
  }
}
