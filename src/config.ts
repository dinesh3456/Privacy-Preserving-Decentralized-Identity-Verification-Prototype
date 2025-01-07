// src/config.ts
export const config = {
  CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS || "",
  IPFS_NODE: process.env.REACT_APP_IPFS_NODE || "http://localhost:5001",
  PROVIDER_URL: process.env.REACT_APP_PROVIDER_URL || "http://localhost:8545",
  isDevelopment: process.env.NODE_ENV === "development",
};

// Function to validate config
export const validateConfig = () => {
  const requiredVars = ["CONTRACT_ADDRESS", "PROVIDER_URL"];
  const missingVars = requiredVars.filter(
    (varName) => !config[varName as keyof typeof config]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};
