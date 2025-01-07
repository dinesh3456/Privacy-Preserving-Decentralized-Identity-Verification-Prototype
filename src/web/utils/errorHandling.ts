export class Web3Error extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "Web3Error";
  }
}

export class DIDError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "DIDError";
  }
}

export function handleError(error: unknown): string {
  if (error instanceof Web3Error) {
    return `Web3 Error: ${error.message}`;
  }
  if (error instanceof DIDError) {
    return `DID Error: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}
