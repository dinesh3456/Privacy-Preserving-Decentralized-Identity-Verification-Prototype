export interface DID {
  id: string;
  credentials: {
    age: number;
    income: number;
    residency: string;
    [key: string]: number | string;
  };
  created: number;
  updated: number;
  secret: string;
}
