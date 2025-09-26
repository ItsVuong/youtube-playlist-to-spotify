import "express-session";

declare module "express-session" {
  interface SessionData {
    spotify?: {
      id?: string;
      access_token: string;
      refresh_token: string;
      expires_at: number;
    }
  }
}
