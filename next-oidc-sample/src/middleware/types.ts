export interface SessionData {
  id: string;
  user?: {
    id: string;
    email: string;
    [key: string]: unknown; // Specify type instead of any
  };
  [key: string]: unknown; // Specify type instead of any
}

export interface RequestWithSession extends NextRequest {
  session?: SessionData;
}
