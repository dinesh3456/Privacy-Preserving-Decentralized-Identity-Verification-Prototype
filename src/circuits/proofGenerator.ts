import { groth16 } from "snarkjs";
import { ethers } from "ethers";
import path from "path";

interface AttributeProof {
  proof: any;
  publicSignals: any;
}

export interface ProofInput {
  age?: number;
  income?: number;
  residency?: string;
  ageThreshold?: number;
  incomeThreshold?: number;
  residencyHash?: string;
  secret: string;
}

export const generateProof = async (input: ProofInput) => {
  const circuitPath = path.join(__dirname, "../build/circuit.wasm");
  const zkeyPath = path.join(__dirname, "../build/circuit_final.zkey");

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    circuitPath,
    zkeyPath
  );

  return {
    proof: {
      a: proof.pi_a.slice(0, 2),
      b: [proof.pi_b[0].slice(0, 2), proof.pi_b[1].slice(0, 2)],
      c: proof.pi_c.slice(0, 2),
    },
    publicSignals,
  };
};

export const verifyProof = async (proof: any, publicSignals: any) => {
  const vkeyPath = path.join(__dirname, "../build/verification_key.json");
  return await groth16.verify(vkeyPath, publicSignals, proof);
};

export class ProofGenerator {
  async generateMultiAttributeProof(
    credentials: any,
    conditions: any
  ): Promise<AttributeProof> {
    try {
      const input = {
        age: credentials.age,
        ageThreshold: conditions.ageThreshold || 0,
        income: credentials.income,
        incomeThreshold: conditions.incomeThreshold || 0,
        residencyHash: this.hashResidency(credentials.residency),
        expectedResidencyHash: this.hashResidency(
          conditions.expectedResidency || ""
        ),
      };

      return await groth16.fullProve(
        input,
        "/circuits/multiAttributeVerification.wasm",
        "/circuits/multiAttributeVerification.zkey"
      );
    } catch (error) {
      console.error("Error generating multi-attribute proof:", error);
      throw error;
    }
  }

  private hashResidency(residency: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(residency));
  }
}
