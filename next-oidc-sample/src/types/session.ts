// ...existing code...
export interface SessionData {
  id?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  access_token?: string;
  id_token?: string;
  state?: string;
  code_verifier?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
