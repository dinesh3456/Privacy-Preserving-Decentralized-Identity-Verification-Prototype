import { ethers, Contract, Signer } from "ethers";
import { BrowserProvider, JsonRpcProvider } from "ethers";

export class Web3Service {
  private provider: BrowserProvider | JsonRpcProvider;
  private signer: Signer | null;
  private contract: Contract | null;

  constructor(providerUrl: string = "http://localhost:8545") {
    this.provider = new JsonRpcProvider(providerUrl);
    this.signer = null;
    this.contract = null;
  }

  async initialize(contractAddress: string, contractABI: any): Promise<void> {
    try {
      // Get signer if using browser provider (MetaMask)
      if (window.ethereum) {
        this.provider = new BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
      }

      this.contract = new Contract(
        contractAddress,
        contractABI,
        this.signer || this.provider
      );
    } catch (error) {
      console.error("Failed to initialize Web3:", error);
      throw new Error("Web3 initialization failed");
    }
  }

  async verifyProof(proof: any, publicSignals: any): Promise<boolean> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.verify(
        proof.a,
        proof.b,
        proof.c,
        publicSignals
      );
      const receipt = await tx.wait();

      // Check for VerificationResult event
      const event = receipt.events?.find(
        (e: any) => e.event === "VerificationResult"
      );

      return event?.args?.success || false;
    } catch (error) {
      console.error("Proof verification failed:", error);
      throw new Error("Proof verification failed");
    }
  }

  async checkVerificationStatus(address: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      return await this.contract.verifiedUsers(address);
    } catch (error) {
      console.error("Failed to check verification status:", error);
      throw new Error("Status check failed");
    }
  }

  async revokeVerification(didId: string, proofId: string): Promise<boolean> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.revokeVerification(didId, proofId);
      const receipt = await tx.wait();
      return true;
    } catch (error) {
      console.error("Revocation failed:", error);
      throw error;
    }
  }
}
