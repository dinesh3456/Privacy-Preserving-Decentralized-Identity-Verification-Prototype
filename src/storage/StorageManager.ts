import { create, IPFS } from "ipfs-http-client";
import type { IPFSHTTPClient } from "ipfs-http-client/types";
import { encrypt, decrypt } from "../utils/crypto";
import { DID } from "../types/did";
import { Credential } from "../did/manager";
import { VerificationResult } from "../services/verificationService";

interface VerificationRecord {
  didId: string;
  timestamp: number;
  result: VerificationResult;
}

export class StorageManager {
  private ipfs: IPFS; // Changed to IPFS
  private encryptionKey: string;

  constructor(ipfsNode: string = "http://localhost:5001") {
    this.ipfs = create({ url: ipfsNode }); // create returns an IPFS instance
    this.encryptionKey = process.env.ENCRYPTION_KEY || "default-key";
  }

  async store(did: DID): Promise<string> {
    // Encrypt sensitive data
    const encryptedCredentials = encrypt(
      JSON.stringify(did.credentials),
      this.encryptionKey
    );

    const didDocument = {
      ...did,
      credentials: encryptedCredentials,
    };

    // Store on IPFS
    const result = await this.ipfs.add(JSON.stringify(didDocument));
    return result.cid.toString();
  }

  async retrieve(cid: string): Promise<DID> {
    const chunks = [];
    for await (const chunk of this.ipfs.cat(cid)) {
      chunks.push(chunk);
    }

    const didDocument = JSON.parse(Buffer.concat(chunks).toString());

    // Decrypt credentials
    const decryptedCredentials = JSON.parse(
      decrypt(didDocument.credentials, this.encryptionKey)
    );

    return {
      ...didDocument,
      credentials: decryptedCredentials,
    };
  }

  async storeVerificationResult(record: VerificationRecord): Promise<string> {
    const result = await this.ipfs.add(JSON.stringify(record));
    return result.cid.toString();
  }
}
