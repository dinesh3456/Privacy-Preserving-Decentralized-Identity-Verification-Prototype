import { Web3Service } from "../utils/web3";
import {
  generateProof,
  verifyProof,
  ProofInput,
} from "../circuits/proofGenerator";
import { DIDManager } from "../did/manager";
import { StorageManager } from "../storage/StorageManager";
import { ethers } from "ethers";
import { DID } from "../types/did";

interface VerificationConditions {
  ageThreshold?: number;
  incomeThreshold?: number;
  expectedResidency?: string;
}

export interface VerificationResult {
  success: boolean;
  proofId?: string;
  attributes: {
    age?: boolean;
    income?: boolean;
    residency?: boolean;
  };
}

export class VerificationService {
  private web3Service: Web3Service;
  private didManager: DIDManager;
  private storageManager: StorageManager;

  constructor(providerUrl: string, contractAddress: string, contractABI: any) {
    this.web3Service = new Web3Service(providerUrl);
    this.didManager = new DIDManager();
    this.storageManager = new StorageManager();
    this.initialize(contractAddress, contractABI);
  }

  private async initialize(
    contractAddress: string,
    contractABI: any
  ): Promise<void> {
    await this.web3Service.initialize(contractAddress, contractABI);
  }

  async verifyIdentityAttribute(
    didId: string,
    attributeName: string,
    condition: any
  ): Promise<boolean> {
    try {
      const did = await this.didManager.getDID(didId);
      if (!did) {
        throw new Error("DID not found");
      }

      const proof = await generateProof({
        [attributeName]: did.credentials[attributeName],
        ageThreshold: condition.threshold,
        secret: did.secret,
      });

      return await this.web3Service.verifyProof(
        proof.proof,
        proof.publicSignals
      );
    } catch (error) {
      console.error("Identity verification failed:", error);
      throw new Error("Verification process failed");
    }
  }

  async verifyMultipleAttributes(
    didId: string,
    conditions: VerificationConditions
  ): Promise<VerificationResult> {
    try {
      const did = await this.didManager.getDID(didId);
      if (!did) throw new Error("DID not found");

      const proof = await generateProof({
        age: Number(did.credentials.age),
        income: Number(did.credentials.income),
        residency: did.credentials.residency,
        ageThreshold: conditions.ageThreshold,
        incomeThreshold: conditions.incomeThreshold,
        residencyHash: conditions.expectedResidency,
        secret: did.secret,
      });

      const verificationSuccess = await this.web3Service.verifyProof(
        proof.proof,
        proof.publicSignals
      );

      const result: VerificationResult = {
        success: verificationSuccess,
        proofId: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(proof))),
        attributes: {
          age:
            conditions.ageThreshold && typeof did.credentials.age === "number"
              ? did.credentials.age >= conditions.ageThreshold
              : undefined,
          income:
            conditions.incomeThreshold &&
            typeof did.credentials.income === "number"
              ? did.credentials.income >= conditions.incomeThreshold
              : undefined,
          residency:
            conditions.expectedResidency &&
            typeof did.credentials.residency === "string"
              ? did.credentials.residency === conditions.expectedResidency
              : undefined,
        },
      };

      if (verificationSuccess) {
        await this.storeVerificationResult(didId, result);
      }

      return result;
    } catch (error) {
      console.error("Multiple attribute verification failed:", error);
      throw new Error("Multi-attribute verification failed");
    }
  }

  private async storeVerificationResult(
    didId: string,
    result: VerificationResult
  ): Promise<void> {
    try {
      const verificationRecord = {
        didId,
        timestamp: Date.now(),
        result,
      };
      await this.storageManager.storeVerificationResult(verificationRecord);
    } catch (error) {
      console.error("Failed to store verification result:", error);
    }
  }

  async revokeVerification(didId: string, proofId: string): Promise<boolean> {
    try {
      return await this.web3Service.revokeVerification(didId, proofId);
    } catch (error) {
      console.error("Failed to revoke verification:", error);
      throw new Error("Verification revocation failed");
    }
  }
}
