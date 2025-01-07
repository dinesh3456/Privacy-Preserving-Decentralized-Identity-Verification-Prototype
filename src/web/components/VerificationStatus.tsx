import React from "react";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Alert, AlertDescription } from "../components/Alert";

interface VerificationResult {
  status: "verified" | "failed" | "pending";
  attribute: string;
  timestamp?: string;
}

interface VerificationStatusProps {
  verificationResults?: VerificationResult[];
  isLoading: boolean;
}

const VerificationStatus = ({
  verificationResults,
  isLoading,
}: VerificationStatusProps) => {
  const getStatusIcon = (status: VerificationResult["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: VerificationResult["status"]) => {
    switch (status) {
      case "verified":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <Alert>
            <AlertDescription>
              Generating and verifying zero-knowledge proofs...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {verificationResults?.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)} flex items-center justify-between`}
            >
              <div className="flex items-center">
                {getStatusIcon(result.status)}
                <span className="ml-2 font-medium">{result.attribute}</span>
              </div>
              <div className="text-sm text-gray-600">
                {result.timestamp
                  ? new Date(result.timestamp).toLocaleString()
                  : ""}
              </div>
            </div>
          ))}

          {(!verificationResults || verificationResults.length === 0) && (
            <div className="text-center py-4 text-gray-500">
              No verification results available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
