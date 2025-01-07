const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  try {
    // Load verification key from the circuit compilation
    const vKeyPath = path.join(__dirname, "../build/verification_key.json");
    const vKey = JSON.parse(fs.readFileSync(vKeyPath, "utf-8"));

    // Format verification key for the contract
    const alpha1 = [
      BigInt(vKey.vk_alpha_1[0]).toString(),
      BigInt(vKey.vk_alpha_1[1]).toString(),
    ];

    const beta2 = [
      [
        BigInt(vKey.vk_beta_2[0][0]).toString(),
        BigInt(vKey.vk_beta_2[0][1]).toString(),
      ],
      [
        BigInt(vKey.vk_beta_2[1][0]).toString(),
        BigInt(vKey.vk_beta_2[1][1]).toString(),
      ],
    ];

    const gamma2 = [
      [
        BigInt(vKey.vk_gamma_2[0][0]).toString(),
        BigInt(vKey.vk_gamma_2[0][1]).toString(),
      ],
      [
        BigInt(vKey.vk_gamma_2[1][0]).toString(),
        BigInt(vKey.vk_gamma_2[1][1]).toString(),
      ],
    ];

    const delta2 = [
      [
        BigInt(vKey.vk_delta_2[0][0]).toString(),
        BigInt(vKey.vk_delta_2[0][1]).toString(),
      ],
      [
        BigInt(vKey.vk_delta_2[1][0]).toString(),
        BigInt(vKey.vk_delta_2[1][1]).toString(),
      ],
    ];

    const IC = vKey.IC.map((point: any) => [
      BigInt(point[0]).toString(),
      BigInt(point[1]).toString(),
    ]);

    // Deploy IdentityVerifier
    const IdentityVerifier =
      await ethers.getContractFactory("IdentityVerifier");
    const verifier = await IdentityVerifier.deploy(
      alpha1,
      beta2,
      gamma2,
      delta2,
      IC
    );

    // Wait for deployment to complete
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();

    console.log("IdentityVerifier deployed to:", verifierAddress);

    // Save deployment info
    const deploymentInfo = {
      verifierAddress,
      deployer: deployer.address,
      network: network.name,
      timestamp: new Date().toISOString(),
      verificationKey: { alpha1, beta2, gamma2, delta2, IC },
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    fs.writeFileSync(
      path.join(deploymentsDir, `${network.name}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(
      "Deployment info saved to:",
      `deployments/${network.name}.json`
    );
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
