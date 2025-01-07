// src/did/manager.ts
import { ethers } from "ethers";
import { build0x } from "../utils/crypto";
import { DID } from "../types/did";

export interface Credential {
  age: number;
  income: number;
  residency: string;
  [key: string]: number | string;
}

export class DIDManager {
  private dids: Map<string, DID>;

  constructor() {
    this.dids = new Map();
    this.loadStoredDIDs();
  }

  async createDID(credentials: Credential): Promise<DID> {
    const randomBytes = ethers.randomBytes(32);
    const id = build0x(randomBytes);

    const did: DID = {
      id,
      credentials,
      created: Date.now(),
      updated: Date.now(),
      secret: ethers.keccak256(ethers.randomBytes(32)),
    };

    this.dids.set(id, did);
    await this.storeDID(did);

    return did;
  }

  private async storeDID(did: DID): Promise<void> {
    try {
      // Store in localStorage for browser environment
      const dids = JSON.parse(localStorage.getItem("dids") || "{}");
      dids[did.id] = did;
      localStorage.setItem("dids", JSON.stringify(dids));
    } catch (error) {
      console.error("Error storing DID:", error);
      throw error;
    }
  }

  private loadStoredDIDs(): void {
    try {
      const dids = JSON.parse(localStorage.getItem("dids") || "{}");
      Object.values(dids).forEach((did: any) => {
        this.dids.set(did.id, did);
      });
    } catch (error) {
      console.error("Error loading DIDs:", error);
    }
  }

  async getDID(id: string): Promise<DID | null> {
    return this.dids.get(id) || null;
  }
}
