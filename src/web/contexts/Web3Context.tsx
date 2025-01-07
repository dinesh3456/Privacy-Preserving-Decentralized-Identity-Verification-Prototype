import React, { createContext, useContext, useState, useEffect } from "react";
import { Web3Service } from "../../utils/web3";
import { ethers } from "ethers";
import IdentityVerifierABI from "../../../artifacts/src/contracts/IdentityVerifier.sol/IdentityVerifier.json";
import { Web3ContextState, EthereumProvider } from "../../types/ethereum";
import { config, validateConfig } from "../../config";

const Web3Context = createContext<Web3ContextState | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getProvider = (): EthereumProvider | undefined => {
    return window.ethereum;
  };

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        // Validate configuration
        validateConfig();

        console.log("Contract Address:", config.CONTRACT_ADDRESS); // Debug log

        const service = new Web3Service(config.PROVIDER_URL);
        await service.initialize(config.CONTRACT_ADDRESS, IdentityVerifierABI);
        setWeb3Service(service);

        const provider = getProvider();
        if (provider?.selectedAddress) {
          setAccount(provider.selectedAddress);
          setIsConnected(true);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to initialize Web3";
        console.error("Web3 initialization error:", errorMessage);
        setError(errorMessage);
      }
    };

    initializeWeb3();
  }, []);
  // Handle account changes
  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      };

      const handleChainChanged = (_chainId: string) => {
        window.location.reload();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);

      return () => {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const connect = async () => {
    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error("MetaMask not installed");
      }

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
  };

  const verifyProof = async (proof: any, publicSignals: any) => {
    if (!web3Service) throw new Error("Web3 service not initialized");
    return await web3Service.verifyProof(proof, publicSignals);
  };

  const checkVerificationStatus = async (address: string) => {
    if (!web3Service) throw new Error("Web3 service not initialized");
    return await web3Service.checkVerificationStatus(address);
  };

  const value: Web3ContextState = {
    web3Service,
    isConnected,
    account,
    error,
    connect,
    disconnect,
    verifyProof,
    checkVerificationStatus,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
