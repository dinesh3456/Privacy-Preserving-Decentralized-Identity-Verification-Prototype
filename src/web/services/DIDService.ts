import { DID } from "../../types/did";
import { DIDManager } from "../../did/manager";
import { VerificationService } from "../../services/verificationService";
import { generateProof } from "../../circuits/proofGenerator";

export class DIDService {
  private didManager: DIDManager;
  private verificationService: VerificationService;

  constructor(providerUrl: string, contractAddress: string, contractABI: any) {
    this.didManager = new DIDManager();
    this.verificationService = new VerificationService(
      providerUrl,
      contractAddress,
      contractABI
    );
  }

  async createDID(credentials: DID["credentials"]): Promise<DID> {
    return this.didManager.createDID(credentials);
  }

  async getDID(id: string): Promise<DID | null> {
    return this.didManager.getDID(id);
  }

  async generateProof(didId: string, attribute: string, condition: any) {
    const did = await this.didManager.getDID(didId);
    if (!did) throw new Error("DID not found");

    return await generateProof({
      [attribute]: did.credentials[attribute],
      ageThreshold: condition.threshold,
      secret: did.secret,
    });
  }
}
