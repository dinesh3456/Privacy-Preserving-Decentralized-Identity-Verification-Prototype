import { ethers } from "ethers";
import { Buffer } from "buffer";
import * as crypto from "crypto";

export function build0x(input: Buffer | string | Uint8Array): string {
  if (Buffer.isBuffer(input)) {
    return "0x" + input.toString("hex");
  }
  if (input instanceof Uint8Array) {
    return "0x" + Buffer.from(input).toString("hex");
  }
  if (typeof input === "string") {
    return input.startsWith("0x") ? input : "0x" + input;
  }
  throw new Error("Invalid input type");
}

export function generateSalt(): string {
  return build0x(ethers.randomBytes(32));
}

export function hashData(data: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

export function isValidHex(hex: string): boolean {
  return ethers.isHexString(hex);
}

export function encrypt(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key), iv);

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted,
    authTag: authTag.toString("hex"),
  });
}

export function decrypt(encryptedData: string, key: string): string {
  const { iv, content, authTag } = JSON.parse(encryptedData);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
