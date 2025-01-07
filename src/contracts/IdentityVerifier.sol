// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityVerifier is Ownable {
    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }

    struct VerifyingKey {
        G1Point alpha1;
        G2Point beta2;
        G2Point gamma2;
        G2Point delta2;
        mapping(uint256 => G1Point) IC;
        uint256 ICLength;
    }

    VerifyingKey verifyingKey;
    mapping(address => bool) public verifiedUsers;
    mapping(bytes32 => bool) public revokedProofs;
    mapping(address => mapping(string => bool)) public verifiedAttributes;

    event VerificationResult(
        address indexed user,
        bool success,
        string attribute
    );
    event ProofRevoked(bytes32 indexed proofId, address indexed user);
    event AttributeVerified(address indexed user, string attribute);

    uint256 constant PRIME_Q =
        21888242871839275222246405745257275088696311157297823662689037894645226208583;

    constructor(
        uint256[2] memory _alpha1,
        uint256[2][2] memory _beta2,
        uint256[2][2] memory _gamma2,
        uint256[2][2] memory _delta2,
        uint256[2][] memory _IC
    ) Ownable(msg.sender) {
        verifyingKey.alpha1 = G1Point(_alpha1[0], _alpha1[1]);
        verifyingKey.beta2 = G2Point(_beta2[0], _beta2[1]);
        verifyingKey.gamma2 = G2Point(_gamma2[0], _gamma2[1]);
        verifyingKey.delta2 = G2Point(_delta2[0], _delta2[1]);
        verifyingKey.ICLength = _IC.length;

        for (uint256 i = 0; i < _IC.length; i++) {
            verifyingKey.IC[i] = G1Point(_IC[i][0], _IC[i][1]);
        }
    }

    function verifyMultipleAttributes(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[] memory input,
        string[] memory attributes
    ) public returns (bool) {
        require(attributes.length > 0, "At least one attribute required");
        require(
            !isProofRevoked(keccak256(abi.encode(a, b, c, input))),
            "Proof revoked"
        );

        Proof memory proof;
        proof.a = G1Point(a[0], a[1]);
        proof.b = G2Point(b[0], b[1]);
        proof.c = G1Point(c[0], c[1]);

        bool isValid = verifyProof(proof, input);
        if (isValid) {
            verifiedUsers[msg.sender] = true;
            for (uint256 i = 0; i < attributes.length; i++) {
                verifiedAttributes[msg.sender][attributes[i]] = true;
                emit AttributeVerified(msg.sender, attributes[i]);
            }
        }

        emit VerificationResult(msg.sender, isValid, attributes[0]);
        return isValid;
    }

    function revokeVerification(bytes32 proofId, address user) public {
        require(msg.sender == user || msg.sender == owner(), "Unauthorized");
        revokedProofs[proofId] = true;
        verifiedUsers[user] = false;
        emit ProofRevoked(proofId, user);
    }

    function isProofRevoked(bytes32 proofId) public view returns (bool) {
        return revokedProofs[proofId];
    }

    function verifyProof(
        Proof memory proof,
        uint256[] memory input
    ) internal view returns (bool) {
        require(
            input.length + 1 == verifyingKey.ICLength,
            "Invalid input length"
        );

        G1Point memory vk_x = G1Point(0, 0);
        vk_x = add(vk_x, verifyingKey.IC[0]);

        for (uint256 i = 0; i < input.length; i++) {
            require(input[i] < PRIME_Q, "Input not in field");
            vk_x = add(vk_x, mul(verifyingKey.IC[i + 1], input[i]));
        }

        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);

        p1[0] = proof.a;
        p1[1] = neg(vk_x);
        p1[2] = neg(proof.c);
        p1[3] = neg(verifyingKey.alpha1);

        p2[0] = proof.b;
        p2[1] = verifyingKey.gamma2;
        p2[2] = verifyingKey.delta2;
        p2[3] = verifyingKey.beta2;

        return pairing(p1, p2);
    }

    // Elliptic curve operations implementation
    function add(
        G1Point memory p1,
        G1Point memory p2
    ) internal view returns (G1Point memory r) {
        uint256[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;

        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0x80, r, 0x40)
        }
        require(success, "EC add failed");
    }

    function mul(
        G1Point memory p,
        uint256 s
    ) internal view returns (G1Point memory r) {
        uint256[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;

        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x60, r, 0x40)
        }
        require(success, "EC mul failed");
    }

    function neg(G1Point memory p) internal pure returns (G1Point memory) {
        if (p.X == 0 && p.Y == 0) return G1Point(0, 0);
        return G1Point(p.X, PRIME_Q - (p.Y % PRIME_Q));
    }

    function pairing(
        G1Point[] memory p1,
        G2Point[] memory p2
    ) internal view returns (bool) {
        require(p1.length == p2.length, "Pairing length mismatch");
        uint256 elements = p1.length;
        uint256 inputSize = elements * 6;
        uint256[] memory input = new uint256[](inputSize);

        for (uint256 i = 0; i < elements; i++) {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }

        uint256[1] memory out;
        bool success;

        assembly {
            success := staticcall(
                sub(gas(), 2000),
                8,
                add(input, 0x20),
                mul(inputSize, 0x20),
                out,
                0x20
            )
        }

        require(success, "Pairing check failed");
        return out[0] != 0;
    }
}
