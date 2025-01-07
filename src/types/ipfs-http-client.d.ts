declare module "ipfs-http-client" {
  export interface IPFS {
    add(data: string): Promise<{ cid: { toString(): string } }>;
    cat(path: string): AsyncIterable<Uint8Array>;
  }

  export function create(options: { url: string }): IPFS;
  export default { create };
}
