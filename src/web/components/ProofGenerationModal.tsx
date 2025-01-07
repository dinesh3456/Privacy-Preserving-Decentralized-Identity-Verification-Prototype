import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/Alert";
import { Shield, AlertCircle } from "lucide-react";

interface ProofGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: string;
  onGenerateProof: (attribute: string, threshold: string) => void;
  loading: boolean;
}

const ProofGenerationModal = ({
  isOpen,
  onClose,
  attribute,
  onGenerateProof,
  loading,
}: ProofGenerationModalProps) => {
  const [threshold, setThreshold] = useState("");

  const handleGenerateProof = () => {
    onGenerateProof(attribute, threshold);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            Generate Proof for {attribute}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Generate a zero-knowledge proof to verify this attribute without
            revealing its actual value.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Threshold
          </label>
          <input
            type="number"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder={`Enter ${attribute.toLowerCase()} threshold`}
          />
          <p className="mt-2 text-sm text-gray-500">
            {attribute === "Age" && "Prove your age is above this value"}
            {attribute === "Income" && "Prove your income is above this value"}
            {attribute === "Residency" &&
              "Prove your residency matches this value"}
          </p>
        </div>

        {loading && (
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            <span className="text-sm text-indigo-700">Generating proof...</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleGenerateProof}
            disabled={!threshold || loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Generate Proof
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProofGenerationModal;
