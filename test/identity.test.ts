import { expect } from "chai";
import { DIDManager } from "../src/did/manager";
import { ProofGenerator } from "../src/circuits/proofGenerator";

describe("Privacy-Preserving Identity Verification", () => {
  let didManager: DIDManager;
  let proofGenerator: ProofGenerator;

  before(async () => {
    didManager = new DIDManager();
    proofGenerator = new ProofGenerator();
  });

  describe("DID Creation and Management", () => {
    it("should create a new DID with credentials", async () => {
      const credentials = {
        age: 25,
        residency: "NY",
        incomeRange: "50000-75000",
      };
      const did = await didManager.createDID(credentials);
      expect(did).to.have.property("id");
      expect(did).to.have.property("credentials");
    });
  });

  describe("ZK-SNARK Proof Generation", () => {
    it("should generate proof for age verification", async () => {
      const ageToProve = 25;
      const threshold = 18;
      const proof = await proofGenerator.generateAgeProof(
        ageToProve,
        threshold
      );
      expect(proof).to.have.property("proof");
      expect(proof).to.have.property("publicSignals");
    });
  });
});
