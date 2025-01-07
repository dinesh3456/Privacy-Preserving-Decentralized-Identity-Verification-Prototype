import React, { useState, useEffect } from "react";
import { Wallet, CircleUserRound, Shield, FileCheck } from "lucide-react";
import { Card, CardHeader, CardContent } from "./Card";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { useWeb3 } from "../contexts/Web3Context";
import { DIDService } from "../services/DIDService";
import IdentityVerifierABI from "../../../artifacts/src/contracts/IdentityVerifier.sol/IdentityVerifier.json";

interface Credentials {
  age: string;
  residency: string;
  income: string;
}

function IdentityDashboard() {
  const { isConnected, account, connect, web3Service } = useWeb3();
  const [credentials, setCredentials] = useState<Credentials>({
    age: "",
    residency: "",
    income: "",
  });
  const [loading, setLoading] = useState(false);
  const [did, setDid] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [didService, setDidService] = useState<DIDService | null>(null);

  useEffect(() => {
    if (web3Service) {
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      if (contractAddress) {
        const service = new DIDService(
          "http://localhost:8545",
          contractAddress,
          IdentityVerifierABI
        );
        setDidService(service);
      }
    }
  }, [web3Service]);

  const handleCreateDID = async () => {
    if (!didService || !account) return;

    try {
      setLoading(true);
      setError(null);

      const result = await didService.createDID({
        age: parseInt(credentials.age),
        residency: credentials.residency,
        income: parseInt(credentials.income),
      });

      setDid(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create DID");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAttribute = async (attribute: string) => {
    if (!didService || !did) return;

    try {
      setLoading(true);
      setError(null);

      const condition = {
        value: credentials[attribute as keyof Credentials],
        threshold: attribute === "age" ? 18 : 0, // Example threshold
      };

      const proof = await didService.generateProof(
        did.id,
        attribute,
        condition
      );

      if (web3Service) {
        const isValid = await web3Service.verifyProof(
          proof.proof,
          proof.publicSignals
        );

        if (isValid) {
          // Handle successful verification
          console.log(`${attribute} verified successfully`);
        } else {
          setError("Verification failed");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold">
                Identity Verifier
              </span>
            </div>
            <Button onClick={connect} disabled={isConnected || loading}>
              <Wallet className="w-4 h-4 mr-2" />
              {isConnected
                ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}`
                : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && <Alert className="mb-6">{error}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DID Creation Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <CircleUserRound className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold">Create Identity</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={credentials.age}
                    onChange={(e) =>
                      setCredentials({ ...credentials, age: e.target.value })
                    }
                    disabled={!isConnected || loading}
                  />
                </div>
                {/* Add other credential inputs */}
                <Button
                  onClick={handleCreateDID}
                  disabled={!isConnected || loading}
                >
                  {loading ? "Creating..." : "Create DID"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FileCheck className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold">Verify Attributes</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {did ? (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">DID: {did.id}</p>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleVerifyAttribute("age")}
                        disabled={loading}
                      >
                        Verify Age
                      </Button>
                      <Button className="w-full" variant="outline">
                        Verify Residency
                      </Button>
                      <Button className="w-full" variant="outline">
                        Verify Income
                      </Button>
                      <Button className="w-full">Verify All Attributes</Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      Create a DID first to verify attributes
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
export default IdentityDashboard;
