import { Web3Service } from "../utils/web3";
import { EthereumProvider } from "./ethereum";

export interface EthereumProvider {
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
}

export interface Web3ContextState {
  web3Service: Web3Service | null;
  isConnected: boolean;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  verifyProof: (proof: any, publicSignals: any) => Promise<boolean>;
  checkVerificationStatus: (address: string) => Promise<boolean>;
  error: string | null;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
